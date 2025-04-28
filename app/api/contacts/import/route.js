import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import Contact from "@/models/Contact"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { contacts, tagIds } = await request.json()

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ message: "No contacts provided" }, { status: 400 })
    }

    await dbConnect()

    // Prepare contacts for insertion
    const contactsToInsert = contacts.map((contact) => ({
      user: session.user.id,
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      phone: contact.phone || "",
      email: contact.email || "",
      tagIds: tagIds || [],
      additionalFields: contact.additionalFields || [],
    }))

    // Insert contacts in bulk
    const result = await Contact.insertMany(contactsToInsert)

    return NextResponse.json({
      message: "Contacts imported successfully",
      count: result.length,
    })
  } catch (error) {
    console.error("Error importing contacts:", error)
    return NextResponse.json({ message: "Failed to import contacts" }, { status: 500 })
  }
}
