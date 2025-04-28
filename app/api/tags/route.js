import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import Tag from "@/models/Tag"

// GET - Fetch all tags for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const tags = await Tag.find({ user: session.user.id }).lean()

    // Transform tags for the frontend
    const transformedTags = tags.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      description: tag.description,
    }))

    return NextResponse.json({ tags: transformedTags })
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ message: "Failed to fetch tags" }, { status: 500 })
  }
}

// POST - Create a new tag
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Tag name is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if tag with same name already exists
    const existingTag = await Tag.findOne({
      user: session.user.id,
      name: { $regex: new RegExp(`^${name}$`, "i") }, // Case insensitive match
    })

    if (existingTag) {
      return NextResponse.json({ message: "A tag with this name already exists" }, { status: 409 })
    }

    const newTag = new Tag({
      user: session.user.id,
      name,
      description: description || "",
    })

    await newTag.save()

    return NextResponse.json(
      {
        message: "Tag created successfully",
        tag: {
          id: newTag._id.toString(),
          name: newTag.name,
          description: newTag.description,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json({ message: "Failed to create tag" }, { status: 500 })
  }
}
