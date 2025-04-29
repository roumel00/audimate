import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { saveTwilioCredentials } from "@/lib/twilio"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { accountSid, authToken } = await request.json()

    const userId = session.user.id
    await saveTwilioCredentials(userId, { accountSid, authToken })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving Twilio credentials:", error)
    return NextResponse.json({ message: "Failed to save Twilio credentials" }, { status: 500 })
  }
}
