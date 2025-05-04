import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await User.findOne({ email: session.user.email });
  if (!user || !user.stripeSubscriptionId) {
    return NextResponse.json({ message: "No active subscription found" }, { status: 400 });
  }

  try {
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ message: "Subscription set to cancel" }, { status: 200 });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ message: "Failed to cancel subscription" }, { status: 500 });
  }
}
