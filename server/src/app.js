import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import pinRoutes from "./routes/pins.js";
import boardRoutes from "./routes/boards.js";

const app = express();

// CLIENT_URL = your Vercel URL (no trailing slash). Not set locally, so everything is allowed there.
const allowed = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true;
app.use(cors({ origin: allowed }));
app.use(express.json());

app.get("/", (req, res) => res.send("ShotVybe API running"));
app.use("/api/auth", authRoutes);
app.use("/api/pins", pinRoutes);
app.use("/api/boards", boardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log("Server on", PORT)))
  .catch((e) => console.error("MongoDB connection failed:", e.message));