import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { saveTwilioCredentials, validateTwilioCredentials } from "@/lib/twilio"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { accountSid, authToken } = await request.json()

    // Validate the credentials before saving
    const validation = await validateTwilioCredentials(accountSid, authToken)

    if (!validation.valid) {
      return NextResponse.json({ message: validation.message || "Invalid Twilio credentials" }, { status: 400 })
    }

    const userId = session.user.id
    await saveTwilioCredentials(userId, { accountSid, authToken })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving Twilio credentials:", error)
    return NextResponse.json({ message: "Failed to save Twilio credentials" }, { status: 500 })
  }
}
