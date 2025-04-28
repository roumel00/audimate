import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import Instruction from "@/models/Instruction"

// GET - Fetch a single instruction by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()

    const instruction = await Instruction.findOne({
      _id: id,
      user: session.user.id,
    }).lean()

    if (!instruction) {
      return NextResponse.json({ message: "Instruction not found" }, { status: 404 })
    }

    return NextResponse.json({
      instruction: {
        id: instruction._id.toString(),
        name: instruction.name,
        greeting: instruction.greeting,
        offering: instruction.offering,
        currentScript: instruction.currentScript,
        objections: instruction.objections || [],
      },
    })
  } catch (error) {
    console.error("Error fetching instruction:", error)
    return NextResponse.json({ message: "Failed to fetch instruction" }, { status: 500 })
  }
}

// PATCH - Update an instruction
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()

    if (!data.name) {
      return NextResponse.json({ message: "Instruction name is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if another instruction with the same name exists (excluding the current instruction)
    const existingInstruction = await Instruction.findOne({
      _id: { $ne: id },
      user: session.user.id,
      name: { $regex: new RegExp(`^${data.name}$`, "i") }, // Case insensitive match
    })

    if (existingInstruction) {
      return NextResponse.json({ message: "An instruction with this name already exists" }, { status: 409 })
    }

    // Update the instruction
    const updatedInstruction = await Instruction.findOneAndUpdate(
      { _id: id, user: session.user.id },
      {
        name: data.name,
        greeting: data.greeting || "",
        offering: data.offering || "",
        currentScript: data.currentScript || "",
        objections: data.objections || [],
      },
      { new: true },
    ).lean()

    if (!updatedInstruction) {
      return NextResponse.json({ message: "Instruction not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Instruction updated successfully",
      instruction: {
        id: updatedInstruction._id.toString(),
        name: updatedInstruction.name,
        greeting: updatedInstruction.greeting,
        offering: updatedInstruction.offering,
        currentScript: updatedInstruction.currentScript,
        objections: updatedInstruction.objections || [],
      },
    })
  } catch (error) {
    console.error("Error updating instruction:", error)
    return NextResponse.json({ message: "Failed to update instruction" }, { status: 500 })
  }
}

// DELETE - Delete an instruction
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    await dbConnect()

    // Delete the instruction
    const result = await Instruction.deleteOne({
      _id: id,
      user: session.user.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Instruction not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Instruction deleted successfully" })
  } catch (error) {
    console.error("Error deleting instruction:", error)
    return NextResponse.json({ message: "Failed to delete instruction" }, { status: 500 })
  }
}
