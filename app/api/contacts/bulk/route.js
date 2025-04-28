import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import Contact from "@/models/Contact"

// DELETE - Delete multiple contacts
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { contactIds } = await request.json()

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ message: "No contact IDs provided" }, { status: 400 })
    }

    await dbConnect()

    // Delete contacts that belong to the user
    const result = await Contact.deleteMany({
      _id: { $in: contactIds },
      user: session.user.id,
    })

    return NextResponse.json({
      message: "Contacts deleted successfully",
      count: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting contacts:", error)
    return NextResponse.json({ message: "Failed to delete contacts" }, { status: 500 })
  }
}

// PATCH - Update multiple contacts (add tags)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { contactIds, tagIds } = await request.json()

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ message: "No contact IDs provided" }, { status: 400 })
    }

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json({ message: "No tag IDs provided" }, { status: 400 })
    }

    await dbConnect()

    // Update contacts that belong to the user
    const result = await Contact.updateMany(
      { _id: { $in: contactIds }, user: session.user.id },
      { $addToSet: { tagIds: { $each: tagIds } } },
    )

    return NextResponse.json({
      message: "Contacts updated successfully",
      count: result.modifiedCount,
    })
  } catch (error) {
    console.error("Error updating contacts:", error)
    return NextResponse.json({ message: "Failed to update contacts" }, { status: 500 })
  }
}
