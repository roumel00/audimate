import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getTwilioClient } from "@/lib/twilio";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return Response.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const { twilioClient, twilioPhoneNumber } = await getTwilioClient(session.user.id);

    if (!twilioPhoneNumber) {
      return Response.json(
        { success: false, error: "Twilio phone number not configured" },
        { status: 500 }
      );
    }

    const realtimeServerUrl = process.env.REALTIME_PUBLIC_URL || "http://localhost:8081";

    const call = await twilioClient.calls.create({
      to: phoneNumber,
      from: twilioPhoneNumber,
      url: `${realtimeServerUrl}/twiml`,
    });

    return Response.json({ success: true, callSid: call.sid });

  } catch (error) {
    console.error("Error starting call:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const callSid = searchParams.get("callSid");

    if (!callSid) {
      return Response.json(
        { success: false, error: "callSid query parameter is required" },
        { status: 400 }
      );
    }

    const { twilioClient } = await getTwilioClient(session.user.id);

    await twilioClient.calls(callSid).update({ status: "completed" });

    return Response.json({ success: true, callSid });
  } catch (error) {
    console.error("Error ending call:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}