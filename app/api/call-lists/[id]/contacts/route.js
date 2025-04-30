import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import CallList from "@/models/CallList"
import Contact from "@/models/Contact"

// POST - Add contacts to a call list
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { contactIds } = await request.json()

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ message: "Contact IDs are required" }, { status: 400 })
    }

    await dbConnect()

    // Check if call list exists
    const callList = await CallList.findOne({
      _id: id,
      user: session.user.id,
    })

    if (!callList) {
      return NextResponse.json({ message: "Call list not found" }, { status: 404 })
    }

    // Verify all contacts exist and belong to the user
    const contacts = await Contact.find({
      _id: { $in: contactIds },
      user: session.user.id,
    }).lean()

    if (contacts.length !== contactIds.length) {
      return NextResponse.json({ message: "One or more contacts are invalid" }, { status: 400 })
    }

    // Add contacts to the call list (avoid duplicates)
    const validContactIds = contacts.map(contact => contact._id)
    const existingContactIds = callList.contactIds || []
    
    // Filter out contacts that are already in the list
    const newContactIds = validContactIds.filter(
      contactId => !existingContactIds.some(id => id.toString() === contactId.toString())
    )
    
    if (newContactIds.length === 0) {
      return NextResponse.json({ message: "All contacts are already in the call list" }, { status: 200 })
    }
    
    // Add new contacts to the list
    callList.contactIds = [...existingContactIds, ...newContactIds]
    await callList.save()

    return NextResponse.json({
      message: `${newContactIds.length} contacts added to the call list`,
      addedCount: newContactIds.length,
    })
  } catch (error) {
    console.error("Error adding contacts to call list:", error)
    return NextResponse.json({ message: "Failed to add contacts to call list" }, { status: 500 })
  }
}

// DELETE - Remove contacts from a call list
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { contactIds } = await request.json()

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ message: "Contact IDs are required" }, { status: 400 })
    }

    await dbConnect()

    // Check if call list exists
    const callList = await CallList.findOne({
      _id: id,
      user: session.user.id,
    })

    if (!callList) {
      return NextResponse.json({ message: "Call list not found" }, { status: 404 })
    }

    // Remove contacts from the call list
    const existingContactIds = callList.contactIds || []
    callList.contactIds = existingContactIds.filter(
      contactId => !contactIds.includes(contactId.toString())
    )
    
    await callList.save()

    return NextResponse.json({
      message: "Contacts removed from the call list",
      removedCount: existingContactIds.length - callList.contactIds.length,
    })
  } catch (error) {
    console.error("Error removing contacts from call list:", error)
    return NextResponse.json({ message: "Failed to remove contacts from call list" }, { status: 500 })
  }
}
