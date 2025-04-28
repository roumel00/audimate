import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import Contact from "@/models/Contact"

// GET - Fetch a single contact by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()

    const contact = await Contact.findOne({
      _id: id,
      user: session.user.id,
    }).lean()

    if (!contact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({
      contact: {
        id: contact._id.toString(),
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        email: contact.email,
        tagIds: contact.tagIds,
        additionalFields: contact.additionalFields || [],
      },
    })
  } catch (error) {
    console.error("Error fetching contact:", error)
    return NextResponse.json({ message: "Failed to fetch contact" }, { status: 500 })
  }
}

// PATCH - Update a contact
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    await dbConnect()

    // Verify the contact belongs to the user
    const existingContact = await Contact.findOne({
      _id: id,
      user: session.user.id,
    })

    if (!existingContact) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    // Update the contact
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        tagIds: data.tagIds || existingContact.tagIds,
        additionalFields: data.additionalFields || [],
      },
      { new: true },
    ).lean()

    return NextResponse.json({
      message: "Contact updated successfully",
      contact: {
        id: updatedContact._id.toString(),
        firstName: updatedContact.firstName,
        lastName: updatedContact.lastName,
        phone: updatedContact.phone,
        email: updatedContact.email,
        tagIds: updatedContact.tagIds || [],
        additionalFields: updatedContact.additionalFields || [],
      },
    })
  } catch (error) {
    console.error("Error updating contact:", error)
    return NextResponse.json({ message: "Failed to update contact" }, { status: 500 })
  }
}

// DELETE - Delete a contact
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()

    // Verify the contact belongs to the user and delete it
    const result = await Contact.deleteOne({
      _id: id,
      user: session.user.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Contact deleted successfully" })
  } catch (error) {
    console.error("Error deleting contact:", error)
    return NextResponse.json({ message: "Failed to delete contact" }, { status: 500 })
  }
}
