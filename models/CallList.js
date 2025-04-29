import mongoose from "mongoose";

const callListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  contactIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }],
  instructionId: { type: mongoose.Schema.Types.ObjectId, ref: "Instruction" },
});

export default mongoose.models.CallList || mongoose.model("CallList", callListSchema);
