import dbConnect from "./mongoose"
import User from "@/models/User"
import twilio from "twilio"
import { encrypt, decrypt } from "@/lib/encryption"

export async function checkTwilioCredentials(userId) {
  await dbConnect()

  const user = await User.findById(userId).select("+twilioSID +twilioAuthToken").lean()

  if (!user) {
    throw new Error("User not found")
  }

  return {
    hasTwilioSID: !!user.twilioSID,
    hasTwilioAuthToken: !!user.twilioAuthToken,
  }
}

export async function saveTwilioCredentials(userId, { accountSid, authToken }) {
  await dbConnect()

  const encryptedSid = encrypt(accountSid)
  const encryptedToken = encrypt(authToken)

  await User.findByIdAndUpdate(userId, {
    twilioSID: encryptedSid,
    twilioAuthToken: encryptedToken,
  })

  return { success: true }
}

export async function getTwilioClient(userId, specificPhoneNumber = null) {
  await dbConnect()

  const user = await User.findById(userId).select("+twilioSID +twilioAuthToken +twilioPhoneNumbers").lean()

  if (!user || !user.twilioSID || !user.twilioAuthToken) {
    throw new Error("Twilio credentials are missing for this user")
  }

  const accountSid = decrypt(user.twilioSID)
  const authToken = decrypt(user.twilioAuthToken)

  const twilioClient = new twilio(accountSid, authToken)

  const twilioPhoneNumber = specificPhoneNumber || user.twilioPhoneNumbers[0]

  return { twilioClient, twilioPhoneNumber }
}
