import mongoose from "mongoose";

const instructionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  offering: String,
  currentScript: String,
  accent: String,
  objections: [
    {
      objection: String,
      answer: String,
    },
  ],
});

export default mongoose.models.Instruction || mongoose.model("Instruction", instructionSchema);
