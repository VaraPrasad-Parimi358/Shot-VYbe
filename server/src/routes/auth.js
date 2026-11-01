import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const r = Router();
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

r.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || password?.length < 6)
    return res.status(400).json({ msg: "Invalid input" });
  if (await User.findOne({ email })) return res.status(409).json({ msg: "Email exists" });
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) });
  res.json({ token: sign(user), user: { id: user._id, name } });
});

r.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash)))
    return res.status(401).json({ msg: "Wrong credentials" });
  res.json({ token: sign(user), user: { id: user._id, name: user.name } });
});
export default r;