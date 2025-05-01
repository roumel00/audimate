import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  company: String,
  credit: { type: Number, default: 10.0 },
  twilioSID: { type: String, select: false },
  twilioAuthToken: { type: String, select: false },
  twilioPhoneNumbers: { type: [String], select: false },
})

export default mongoose.models.User || mongoose.model("User", userSchema)
