import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import PhoneCall from "@/models/PhoneCall"

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await dbConnect()

    const { summary } = await request.json()

    if (!summary) {
      return Response.json({ success: false, error: "summary is required" }, { status: 400 });
    }

    const updatedCall = await PhoneCall.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { summary },
      { new: true }
    );

    if (!updatedCall) {
      return Response.json(
        { success: false, error: "PhoneCall not found or not owned by user" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, phoneCall: updatedCall });
  } catch (error) {
    console.error("Error updating phone call summary:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}