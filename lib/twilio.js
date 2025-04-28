import { hash, compare } from "@node-rs/bcrypt"
import dbConnect from "./mongoose"
import User from "@/models/User"

// Hash Twilio credentials before storing
export async function hashTwilioCredentials(value) {
  return await hash(value, 12)
}

// Verify Twilio credentials
export async function verifyTwilioCredential(plainValue, hashedValue) {
  return await compare(plainValue, hashedValue)
}

// Check if user has Twilio credentials
export async function checkTwilioCredentials(userId) {
  await dbConnect()
  
  // Use select('+field') to explicitly include fields marked with select: false
  const user = await User.findById(userId).select('+twilioSID +twilioAuthToken').lean()
  
  if (!user) {
    throw new Error("User not found")
  }
  
  return {
    hasTwilioSID: !!user.twilioSID,
    hasTwilioAuthToken: !!user.twilioAuthToken
  }
}

// Save Twilio credentials
export async function saveTwilioCredentials(userId, { accountSid, authToken }) {
  await dbConnect()
  
  // Hash the credentials before storing
  const hashedSid = await hashTwilioCredentials(accountSid)
  const hashedToken = await hashTwilioCredentials(authToken)
  
  await User.findByIdAndUpdate(userId, {
    twilioSID: hashedSid,
    twilioAuthToken: hashedToken
  })
  
  return { success: true }
}

// Validate Twilio credentials by making a test API call
export async function validateTwilioCredentials(accountSid, authToken) {
  try {
    // This is just a validation function - we're not storing the raw credentials
    // In a real implementation, you would make a test API call to Twilio here
    
    // For now, we'll just check if they're not empty
    if (!accountSid || !authToken) {
      return { valid: false, message: "Credentials cannot be empty" }
    }
    
    // In a real implementation, you would use the Twilio SDK to make a test API call
    // const client = new Twilio(accountSid, authToken)
    // await client.api.accounts(accountSid).fetch()
    
    return { valid: true }
  } catch (error) {
    return { 
      valid: false, 
      message: error.message || "Failed to validate Twilio credentials" 
    }
  }
}
