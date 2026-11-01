import { Router } from "express";
import multer from "multer";
import { Vibrant } from "node-vibrant/node";
import cloudinary from "../config/cloudinary.js";
import Pin from "../models/Pin.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const r = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const COLORS = {
  red: [230, 30, 30], orange: [255, 140, 0], yellow: [250, 220, 30],
  green: [40, 170, 60], blue: [30, 80, 220], purple: [130, 50, 190],
  pink: [255, 130, 180], brown: [120, 70, 30], black: [15, 15, 15],
  white: [245, 245, 245], grey: [128, 128, 128], gray: [128, 128, 128],
};

// upload a pin
r.post("/", auth, upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "Image required" });

  const palette = await Vibrant.from(req.file.buffer).getPalette();
  const [R, G, B] = (palette.Vibrant ?? palette.Muted).rgb.map(Math.round);

  const url = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "shotvybe" },
      (err, out) => (err ? reject(err) : resolve(out.secure_url))
    ).end(req.file.buffer);
  });

  const tags = (req.body.tags || "").split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
  const pin = await Pin.create({ userId: req.userId, imageUrl: url, tags, dominantColor: { r: R, g: G, b: B } });
  res.status(201).json(pin);
});

// latest pins
r.get("/", async (req, res) => {
  const page = Number(req.query.page) || 1, limit = 20;
  const pins = await Pin.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
    .populate("userId", "name");
  res.json(pins);
});

// pins I liked / saved
r.get("/liked", auth, async (req, res) => {
  const pins = await Pin.find({ likes: req.userId }).sort({ createdAt: -1 }).populate("userId", "name");
  res.json(pins);
});
r.get("/saved", auth, async (req, res) => {
  const pins = await Pin.find({ savedBy: req.userId }).sort({ createdAt: -1 }).populate("userId", "name");
  res.json(pins);
});

// search by color and tags
r.get("/search", async (req, res) => {
  const words = (req.query.q || "").toLowerCase().split(/\s+/).filter(Boolean);
  const colorWord = words.find((w) => COLORS[w]);
  const tagWords = words
    .filter((w) => !COLORS[w])
    .flatMap((w) => [w, w.replace(/s$/, "")]);

  const filter = tagWords.length ? { tags: { $in: tagWords } } : {};
  let pins = await Pin.find(filter).sort({ createdAt: -1 }).populate("userId", "name").lean();

  if (colorWord) {
    const [R, G, B] = COLORS[colorWord];
    const MAX = Math.sqrt(3 * 255 ** 2); // 441.7
    pins = pins
      .filter((p) => p.dominantColor?.r !== undefined)
      .map((p) => {
        const { r, g, b } = p.dominantColor;
        const d = Math.sqrt((R - r) ** 2 + (G - g) ** 2 + (B - b) ** 2);
        return { ...p, match: +(1 - d / MAX).toFixed(3) };
      })
      .filter((p) => p.match >= 0.6)
      .sort((a, b) => b.match - a.match);
  }
  res.json(pins);
});

// trending: (likes + 2*saves) / (hours + 2)^1.5
r.get("/trending", async (req, res) => {
  const pins = await Pin.find().populate("userId", "name").lean();
  const now = Date.now();
  const ranked = pins
    .map((p) => {
      const likes = p.likes?.length ?? 0;
      const saves = p.savedBy?.length ?? 0;
      const hours = (now - new Date(p.createdAt)) / 36e5;
      const score = (likes + 2 * saves) / Math.pow(hours + 2, 1.5);
      return { ...p, score: +score.toFixed(4) };
    })
    .sort((a, b) => b.score - a.score);
  res.json(ranked);
});

// like / save toggle
const toggle = (field) => async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ msg: "Pin not found" });
    const i = pin[field].findIndex((u) => u.toString() === req.userId);
    if (i >= 0) pin[field].splice(i, 1);
    else pin[field].push(req.userId);
    await pin.save();
    res.json({ count: pin[field].length, active: i < 0 });
  } catch {
    res.status(400).json({ msg: "Invalid pin id" });
  }
};
r.put("/:id/like", auth, toggle("likes"));
r.put("/:id/save", auth, toggle("savedBy"));

// delete (owner only)
r.delete("/:id", auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);
    if (!pin) return res.status(404).json({ msg: "Pin not found" });
    if (pin.userId.toString() !== req.userId)
      return res.status(403).json({ msg: "Not your pin" });

    const m = pin.imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^./]+$/);
    if (m) await cloudinary.uploader.destroy(m[1]).catch(() => {});

    await pin.deleteOne();
    res.json({ msg: "Deleted" });
  } catch {
    res.status(400).json({ msg: "Invalid pin id" });
  }
});
// who I follow (list of user ids)
r.get("/following", auth, async (req, res) => {
  const u = await User.findById(req.userId).select("following");
  res.json((u?.following || []).map(String));
});

// follow / unfollow toggle
r.put("/follow/:userId", auth, async (req, res) => {
  try {
    if (req.params.userId === req.userId)
      return res.status(400).json({ msg: "You can't follow yourself" });
    if (!(await User.exists({ _id: req.params.userId })))
      return res.status(404).json({ msg: "User not found" });

    const me = await User.findById(req.userId);
    const i = me.following.findIndex((u) => u.toString() === req.params.userId);
    if (i >= 0) me.following.splice(i, 1);
    else me.following.push(req.params.userId);
    await me.save();
    res.json({ following: i < 0 });
  } catch {
    res.status(400).json({ msg: "Invalid user id" });
  }
});
// my stats: posts, followers, following
r.get("/me/stats", auth, async (req, res) => {
  const [posts, followers, me] = await Promise.all([
    Pin.countDocuments({ userId: req.userId }),
    User.countDocuments({ following: req.userId }),
    User.findById(req.userId).select("following"),
  ]);
  res.json({ posts, followers, following: me?.following.length || 0 });
});
// list of people: /pins/people/followers or /pins/people/following
r.get("/people/:type", auth, async (req, res) => {
  const { type } = req.params;
  if (type === "followers") {
    const users = await User.find({ following: req.userId }).select("name");
    return res.json(users);
  }
  if (type === "following") {
    const me = await User.findById(req.userId).populate("following", "name");
    return res.json(me?.following || []);
  }
  res.status(400).json({ msg: "Invalid type" });
});
// my own uploads
r.get("/mine", auth, async (req, res) => {
  const pins = await Pin.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(pins);
});
export default r;