import mongoose from "mongoose";

const phoneCallSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
  instruction: { type: mongoose.Schema.Types.ObjectId, ref: "Instruction" },
  transcription: String,
  callLength: Number,
  summary: String,
});

export default mongoose.models.PhoneCall || mongoose.model("PhoneCall", phoneCallSchema);
