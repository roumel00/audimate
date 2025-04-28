import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { checkTwilioCredentials } from "@/lib/twilio"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const twilioStatus = await checkTwilioCredentials(userId)

    return NextResponse.json(twilioStatus)
  } catch (error) {
    console.error("Error checking Twilio credentials:", error)
    return NextResponse.json({ message: "Failed to check Twilio credentials" }, { status: 500 })
  }
}
