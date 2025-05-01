import mongoose from "mongoose"

const phoneCallSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" },
  instruction: { type: mongoose.Schema.Types.ObjectId, ref: "Instruction" },
  callList: { type: mongoose.Schema.Types.ObjectId, ref: "CallList" },
  status: String,
  transcription: String,
  callLength: {
    type: Number,
    get: (v) => Number.parseFloat(v.toFixed(1)),
    set: (v) => Number.parseFloat(v.toFixed(1)),
  },
  summary: String,
  inputTokens: Number,
  outputTokens: Number,
})

export default mongoose.models.PhoneCall || mongoose.model("PhoneCall", phoneCallSchema)
