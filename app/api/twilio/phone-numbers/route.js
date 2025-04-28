import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"

// GET - Fetch user's Twilio phone numbers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Use select('+field') to explicitly include fields marked with select: false
    const user = await User.findById(session.user.id).select("+twilioPhoneNumbers").lean()

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ phoneNumbers: user.twilioPhoneNumbers || [] })
  } catch (error) {
    console.error("Error fetching Twilio phone numbers:", error)
    return NextResponse.json({ message: "Failed to fetch phone numbers" }, { status: 500 })
  }
}

// POST - Add a new Twilio phone number
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { phoneNumber } = await request.json()

    // Basic validation
    if (!phoneNumber) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    // Format validation (simple check)
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { message: "Phone number must be in E.164 format (e.g., +12345678901)" },
        { status: 400 },
      )
    }

    await dbConnect()

    // Check if the phone number already exists
    const existingUser = await User.findById(session.user.id).select("+twilioPhoneNumbers")

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Initialize twilioPhoneNumbers array if it doesn't exist
    if (!existingUser.twilioPhoneNumbers) {
      existingUser.twilioPhoneNumbers = []
    }

    // Check if phone number already exists
    if (existingUser.twilioPhoneNumbers.includes(phoneNumber)) {
      return NextResponse.json({ message: "Phone number already exists" }, { status: 409 })
    }

    // Add the phone number
    existingUser.twilioPhoneNumbers.push(phoneNumber)
    await existingUser.save()

    return NextResponse.json({ success: true, message: "Phone number added successfully" })
  } catch (error) {
    console.error("Error adding Twilio phone number:", error)
    return NextResponse.json({ message: "Failed to add phone number" }, { status: 500 })
  }
}

// DELETE - Remove a Twilio phone number
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { phoneNumber } = await request.json()

    // Basic validation
    if (!phoneNumber) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    await dbConnect()

    // Find the user and remove the phone number
    const user = await User.findById(session.user.id).select("+twilioPhoneNumbers")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if the phone number exists
    if (!user.twilioPhoneNumbers || !user.twilioPhoneNumbers.includes(phoneNumber)) {
      return NextResponse.json({ message: "Phone number not found" }, { status: 404 })
    }

    // Remove the phone number
    user.twilioPhoneNumbers = user.twilioPhoneNumbers.filter((number) => number !== phoneNumber)
    await user.save()

    return NextResponse.json({ success: true, message: "Phone number removed successfully" })
  } catch (error) {
    console.error("Error removing Twilio phone number:", error)
    return NextResponse.json({ message: "Failed to remove phone number" }, { status: 500 })
  }
}
