import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creditAmount } = await req.json();
    const units = Math.round(Number(creditAmount) * 100);
    if (!units || units < 1) {
      return NextResponse.json({ error: "Invalid credit amount" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_CREDIT_PRICE_ID,
          quantity: units,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/purchase/cancel`,
      metadata: {
        userId: user._id.toString(),
        creditUnits: String(units),
      },
    });

    return NextResponse.json({ url: stripeSession.url }, { status: 200 });
  } catch (err) {
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
