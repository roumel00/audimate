import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import dbConnect from "@/lib/mongoose"
import PhoneCall from "@/models/PhoneCall"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { contactId, instructionId, callListId, transcription, callLength, status } = await request.json()

    if (!contactId) {
      return Response.json({ success: false, error: "Contact ID is required" }, { status: 400 })
    }

    const phoneCall = new PhoneCall({
      user: session.user.id,
      contact: contactId,
      callList: callListId,
      instruction: instructionId,
      transcription,
      callLength,
      status,
      summary: null,
    })

    await phoneCall.save()

    return Response.json({ success: true, phoneCall })
  } catch (error) {
    console.error("Error saving phone call:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get("contactId")
    const callListId = searchParams.get("callListId")

    const query = { user: session.user.id };
    if (contactId) {
      query.contact = contactId;
    }
    if (callListId) {
      query.callList = callListId;
    }
    const phoneCalls = await PhoneCall.find(query)
      .populate("contact", "name phoneNumber")
      .populate("instruction", "title")
      .sort({ _id: -1 })

    return Response.json({ success: true, phoneCalls })
  } catch (error) {
    console.error("Error fetching phone calls:", error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
