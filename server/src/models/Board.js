import mongoose from "mongoose";
export default mongoose.model("Board", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, trim: true },
  pins: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pin" }],
}, { timestamps: true }));