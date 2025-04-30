import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import Instruction from "@/models/Instruction"

// GET - Fetch all instructions for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const instructions = await Instruction.find({ user: session.user.id }).lean()

    // Transform instructions for the frontend
    const transformedInstructions = instructions.map((instruction) => ({
      id: instruction._id.toString(),
      name: instruction.name,
      offering: instruction.offering,
      currentScript: instruction.currentScript,
      objections: instruction.objections || [],
    }))

    return NextResponse.json({ instructions: transformedInstructions })
  } catch (error) {
    console.error("Error fetching instructions:", error)
    return NextResponse.json({ message: "Failed to fetch instructions" }, { status: 500 })
  }
}

// POST - Create a new instruction
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!data.name) {
      return NextResponse.json({ message: "Instruction name is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if instruction with same name already exists
    const existingInstruction = await Instruction.findOne({
      user: session.user.id,
      name: { $regex: new RegExp(`^${data.name}$`, "i") }, // Case insensitive match
    })

    if (existingInstruction) {
      return NextResponse.json({ message: "An instruction with this name already exists" }, { status: 409 })
    }

    const newInstruction = new Instruction({
      user: session.user.id,
      name: data.name,
      offering: data.offering || "",
      currentScript: data.currentScript || "",
      objections: data.objections || [],
    })

    await newInstruction.save()

    return NextResponse.json(
      {
        message: "Instruction created successfully",
        instruction: {
          id: newInstruction._id.toString(),
          name: newInstruction.name,
          offering: newInstruction.offering,
          currentScript: newInstruction.currentScript,
          objections: newInstruction.objections || [],
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating instruction:", error)
    return NextResponse.json({ message: "Failed to create instruction" }, { status: 500 })
  }
}
