import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import Tag from "@/models/Tag"
import Contact from "@/models/Contact"

// GET - Fetch a single tag by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()

    const tag = await Tag.findOne({
      _id: id,
      user: session.user.id,
    }).lean()

    if (!tag) {
      return NextResponse.json({ message: "Tag not found" }, { status: 404 })
    }

    return NextResponse.json({
      tag: {
        id: tag._id.toString(),
        name: tag.name,
        description: tag.description,
      },
    })
  } catch (error) {
    console.error("Error fetching tag:", error)
    return NextResponse.json({ message: "Failed to fetch tag" }, { status: 500 })
  }
}

// PATCH - Update a tag
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Tag name is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if another tag with the same name exists (excluding the current tag)
    const existingTag = await Tag.findOne({
      _id: { $ne: id },
      user: session.user.id,
      name: { $regex: new RegExp(`^${name}$`, "i") }, // Case insensitive match
    })

    if (existingTag) {
      return NextResponse.json({ message: "A tag with this name already exists" }, { status: 409 })
    }

    // Update the tag
    const updatedTag = await Tag.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { name, description },
      { new: true },
    ).lean()

    if (!updatedTag) {
      return NextResponse.json({ message: "Tag not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Tag updated successfully",
      tag: {
        id: updatedTag._id.toString(),
        name: updatedTag.name,
        description: updatedTag.description,
      },
    })
  } catch (error) {
    console.error("Error updating tag:", error)
    return NextResponse.json({ message: "Failed to update tag" }, { status: 500 })
  }
}

// DELETE - Delete a tag
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()

    // Delete the tag
    const result = await Tag.deleteOne({
      _id: id,
      user: session.user.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Tag not found" }, { status: 404 })
    }

    // Remove the tag from all contacts
    await Contact.updateMany({ user: session.user.id, tagIds: id }, { $pull: { tagIds: id } })

    return NextResponse.json({ message: "Tag deleted successfully" })
  } catch (error) {
    console.error("Error deleting tag:", error)
    return NextResponse.json({ message: "Failed to delete tag" }, { status: 500 })
  }
}
