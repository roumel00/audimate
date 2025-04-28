import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  description: String,
});

export default mongoose.models.Tag || mongoose.model("Tag", tagSchema);
