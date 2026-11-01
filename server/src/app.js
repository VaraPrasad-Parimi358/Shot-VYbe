import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import pinRoutes from "./routes/pins.js";
import boardRoutes from "./routes/boards.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);
app.use("/api/boards", boardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: err.message || "Server error" });
});

mongoose.connect(process.env.MONGO_URI).then(() =>
  app.listen(process.env.PORT, () => console.log("Server on", process.env.PORT)));