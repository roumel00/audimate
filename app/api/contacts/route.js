import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import Contact from "@/models/Contact"
import Tag from "@/models/Tag"

// GET - Fetch contacts with pagination and filtering
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const tagIds = searchParams.get("tags")?.split(",").filter(Boolean) || []

    const skip = (page - 1) * limit

    // Build query
    const query = { user: session.user.id }

    // Add tag filtering if tags are provided
    if (tagIds.length > 0) {
      query.tagIds = { $in: tagIds }
    }

    // Get total count for pagination
    const total = await Contact.countDocuments(query)

    // Fetch contacts with pagination
    const contacts = await Contact.find(query).sort({ lastName: 1, firstName: 1 }).skip(skip).limit(limit).lean()

    // Fetch all tags to populate tag names
    const tags = await Tag.find({ user: session.user.id }).lean()
    const tagsMap = tags.reduce((acc, tag) => {
      acc[tag._id.toString()] = tag
      return acc
    }, {})

    // Add tag details to contacts
    const contactsWithTags = contacts.map((contact) => {
      const contactObj = {
        ...contact,
        id: contact._id.toString(),
        tags: (contact.tagIds || [])
          .map((tagId) => {
            const tagIdStr = tagId.toString()
            return tagsMap[tagIdStr]
              ? {
                  id: tagIdStr,
                  name: tagsMap[tagIdStr].name,
                  description: tagsMap[tagIdStr].description,
                }
              : null
          })
          .filter(Boolean),
      }
      delete contactObj._id
      delete contactObj.__v
      return contactObj
    })

    return NextResponse.json({
      contacts: contactsWithTags,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ message: "Failed to fetch contacts" }, { status: 500 })
  }
}

// POST - Create a new contact
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    await dbConnect()

    const newContact = new Contact({
      user: session.user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      tagIds: data.tagIds || [],
      additionalFields: data.additionalFields || [],
    })

    await newContact.save()

    return NextResponse.json(
      {
        message: "Contact created successfully",
        contact: {
          id: newContact._id.toString(),
          firstName: newContact.firstName,
          lastName: newContact.lastName,
          phone: newContact.phone,
          email: newContact.email,
          tagIds: newContact.tagIds,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ message: "Failed to create contact" }, { status: 500 })
  }
}
