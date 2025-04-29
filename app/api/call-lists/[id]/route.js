import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import CallList from "@/models/CallList"
import Contact from "@/models/Contact"
import Instruction from "@/models/Instruction"
import Tag from "@/models/Tag"

// GET - Fetch a specific call list with details
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await dbConnect()

    // Get the call list
    const callList = await CallList.findOne({
      _id: id,
      user: session.user.id,
    }).lean()

    if (!callList) {
      return NextResponse.json({ message: "Call list not found" }, { status: 404 })
    }

    // Get the instruction if available
    let instruction = null
    if (callList.instructionId) {
      instruction = await Instruction.findOne({
        _id: callList.instructionId,
        user: session.user.id,
      }).lean()

      if (instruction) {
        instruction = {
          id: instruction._id.toString(),
          name: instruction.name,
          greeting: instruction.greeting,
          offering: instruction.offering,
          currentScript: instruction.currentScript,
          objections: instruction.objections || [],
        }
      }
    }

    // Get the contacts
    const contacts =
      callList.contactIds && callList.contactIds.length > 0
        ? await Contact.find({
            _id: { $in: callList.contactIds },
            user: session.user.id,
          }).lean()
        : []

    // Get all tag IDs from contacts
    const tagIds = contacts
      .flatMap((contact) => contact.tagIds || [])
      .filter((id) => id)
      .map((id) => id.toString())

    // Fetch all tags in a single query
    const tags = tagIds.length > 0 ? await Tag.find({ _id: { $in: tagIds } }).lean() : []

    // Create a map of tag IDs to tag objects
    const tagMap = tags.reduce((map, tag) => {
      map[tag._id.toString()] = tag
      return map
    }, {})

    // Transform contacts for the frontend
    const transformedContacts = contacts.map((contact) => {
      // Get tags for this contact
      const contactTags =
        contact.tagIds
          ?.map((tagId) => {
            const tagIdStr = tagId.toString()
            return tagMap[tagIdStr]
              ? {
                  id: tagIdStr,
                  name: tagMap[tagIdStr].name,
                  description: tagMap[tagIdStr].description,
                }
              : null
          })
          .filter(Boolean) || []

      return {
        id: contact._id.toString(),
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        email: contact.email,
        tags: contactTags,
      }
    })

    return NextResponse.json({
      callList: {
        id: callList._id.toString(),
        name: callList.name,
        instructionId: callList.instructionId ? callList.instructionId.toString() : null,
        contacts: transformedContacts,
        instruction,
      },
    })
  } catch (error) {
    console.error("Error fetching call list:", error)
    return NextResponse.json({ message: "Failed to fetch call list" }, { status: 500 })
  }
}

// PATCH - Update a call list
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    await dbConnect()

    // Check if call list exists
    const callList = await CallList.findOne({
      _id: id,
      user: session.user.id,
    })

    if (!callList) {
      return NextResponse.json({ message: "Call list not found" }, { status: 404 })
    }

    // Check for name uniqueness if name is being updated
    if (data.name && data.name !== callList.name) {
      const existingCallList = await CallList.findOne({
        _id: { $ne: id },
        user: session.user.id,
        name: { $regex: new RegExp(`^${data.name}$`, "i") }, // Case insensitive match
      })

      if (existingCallList) {
        return NextResponse.json({ message: "A call list with this name already exists" }, { status: 409 })
      }
    }

    // Validate instruction ID if provided
    if (data.instructionId) {
      const instruction = await Instruction.findOne({
        _id: data.instructionId,
        user: session.user.id,
      })

      if (!instruction) {
        return NextResponse.json({ message: "Invalid instruction ID" }, { status: 400 })
      }
    }

    // Update fields
    if (data.name) callList.name = data.name
    if (data.instructionId !== undefined) callList.instructionId = data.instructionId || null

    await callList.save()

    return NextResponse.json({
      message: "Call list updated successfully",
      callList: {
        id: callList._id.toString(),
        name: callList.name,
        instructionId: callList.instructionId ? callList.instructionId.toString() : null,
      },
    })
  } catch (error) {
    console.error("Error updating call list:", error)
    return NextResponse.json({ message: "Failed to update call list" }, { status: 500 })
  }
}

// DELETE - Delete a call list
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()

    // Delete the call list
    const result = await CallList.deleteOne({
      _id: id,
      user: session.user.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Call list not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Call list deleted successfully" })
  } catch (error) {
    console.error("Error deleting call list:", error)
    return NextResponse.json({ message: "Failed to delete call list" }, { status: 500 })
  }
}
