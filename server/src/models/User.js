import mongoose from "mongoose";
export default mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  passwordHash: { type: String, required: true },
  
}, { timestamps: true }));