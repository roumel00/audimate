import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import CallList from "@/models/CallList"
import Contact from "@/models/Contact"
import Instruction from "@/models/Instruction"

// GET - Fetch all call lists for the current user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Get all call lists for the user
    const callLists = await CallList.find({ user: session.user.id }).lean()

    // Get all instruction IDs from call lists
    const instructionIds = callLists.map(list => list.instructionId).filter(Boolean)
    
    // Fetch instructions in a single query
    const instructions = instructionIds.length > 0 
      ? await Instruction.find({ _id: { $in: instructionIds } }).lean()
      : []
    
    // Create a map of instruction IDs to instruction objects
    const instructionMap = instructions.reduce((map, instruction) => {
      map[instruction._id.toString()] = instruction
      return map
    }, {})

    // Count contacts for each call list
    const contactCounts = await Promise.all(
      callLists.map(async (list) => {
        const count = await Contact.countDocuments({ 
          _id: { $in: list.contactIds || [] } 
        })
        return { listId: list._id.toString(), count }
      })
    )

    // Create a map of list IDs to contact counts
    const contactCountMap = contactCounts.reduce((map, item) => {
      map[item.listId] = item.count
      return map
    }, {})

    // Transform call lists for the frontend
    const transformedCallLists = callLists.map((list) => {
      const instructionId = list.instructionId ? list.instructionId.toString() : null
      const instruction = instructionId ? instructionMap[instructionId] : null
      
      return {
        id: list._id.toString(),
        name: list.name,
        contactCount: contactCountMap[list._id.toString()] || 0,
        instructionId: instructionId,
        instructionName: instruction ? instruction.name : null,
      }
    })

    return NextResponse.json({ callLists: transformedCallLists })
  } catch (error) {
    console.error("Error fetching call lists:", error)
    return NextResponse.json({ message: "Failed to fetch call lists" }, { status: 500 })
  }
}

// POST - Create a new call list
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    if (!data.name) {
      return NextResponse.json({ message: "Call list name is required" }, { status: 400 })
    }

    await dbConnect()

    // Check if call list with same name already exists
    const existingCallList = await CallList.findOne({
      user: session.user.id,
      name: { $regex: new RegExp(`^${data.name}$`, "i") }, // Case insensitive match
    })

    if (existingCallList) {
      return NextResponse.json({ message: "A call list with this name already exists" }, { status: 409 })
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

    // Create new call list
    const newCallList = new CallList({
      user: session.user.id,
      name: data.name,
      instructionId: data.instructionId || null,
      contactIds: data.contactIds || [],
    })

    await newCallList.save()

    return NextResponse.json(
      {
        message: "Call list created successfully",
        callList: {
          id: newCallList._id.toString(),
          name: newCallList.name,
          instructionId: newCallList.instructionId ? newCallList.instructionId.toString() : null,
          contactCount: newCallList.contactIds.length,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating call list:", error)
    return NextResponse.json({ message: "Failed to create call list" }, { status: 500 })
  }
}
