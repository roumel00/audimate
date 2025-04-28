import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  additionalFields: [
    {
      field: String,
      value: String,
    },
  ],
  tagIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
});

export default mongoose.models.Contact || mongoose.model("Contact", contactSchema);
