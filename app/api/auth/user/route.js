import { getServerSession } from "next-auth/next"
import { authOptions } from "../[...nextauth]/route"
import User from "@/models/User"
import dbConnect from "@/lib/mongoose"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Return only necessary user information
    return Response.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        credit: user.credit
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return Response.json({ success: false, error: error.message || "Failed to fetch user" }, { status: 500 })
  }
}
