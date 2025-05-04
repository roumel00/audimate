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

    const { tier } = await req.json();

    const priceMap = {
      business: process.env.STRIPE_BUSINESS_PRICE_ID,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    };

    const priceId = priceMap[tier];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
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

    // Cancel current subscription if exists
    if (user.stripeSubscriptionId) {
      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, { expand: ["items.data"] });

      const subscriptionItemId = sub.items.data[0].id;

      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        items: [
          {
            id: subscriptionItemId,
            price: priceId,
          },
        ],
        proration_behavior: "create_prorations",
      });

      user.tier = tier;
      await user.save();

      return NextResponse.json({ success: true, message: "Subscription updated" });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/purchase/cancel`,
      metadata: { userId: user._id.toString(), tier },
    });

    return NextResponse.json({ url: stripeSession.url }, { status: 200 });
  } catch (err) {
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
