import { Router } from "express";
import Board from "../models/Board.js";
import Pin from "../models/Pin.js";
import auth from "../middleware/auth.js";

const r = Router();

// a user counts as a saver if the pin is in any of their boards
const syncSaved = async (userId, pinId) => {
  const still = await Board.exists({ userId, pins: pinId });
  await Pin.updateOne(
    { _id: pinId },
    still ? { $addToSet: { savedBy: userId } } : { $pull: { savedBy: userId } }
  );
};

r.get("/", auth, async (req, res) => {
  const boards = await Board.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .populate("pins", "imageUrl")
    .lean();
  res.json(boards);
});

r.post("/", auth, async (req, res) => {
  const name = (req.body.name || "").trim();
  if (!name) return res.status(400).json({ msg: "Name required" });
  const board = await Board.create({ userId: req.userId, name });
  res.status(201).json(board);
});

// add or remove a pin from a board
r.put("/:id/pins/:pinId", auth, async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.userId });
    if (!board) return res.status(404).json({ msg: "Board not found" });
    const i = board.pins.findIndex((p) => p.toString() === req.params.pinId);
    if (i >= 0) board.pins.splice(i, 1);
    else board.pins.push(req.params.pinId);
    await board.save();
    await syncSaved(req.userId, req.params.pinId);
    res.json({ added: i < 0 });
  } catch {
    res.status(400).json({ msg: "Invalid id" });
  }
});

r.delete("/:id", auth, async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.userId });
    if (!board) return res.status(404).json({ msg: "Board not found" });
    const pinIds = [...board.pins];
    await board.deleteOne();
    for (const id of pinIds) await syncSaved(req.userId, id);
    res.json({ msg: "Deleted" });
  } catch {
    res.status(400).json({ msg: "Invalid id" });
  }
});

export default r;