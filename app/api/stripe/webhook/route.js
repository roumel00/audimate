import Stripe from "stripe";
import User from "@/models/User";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const tierMap = {
  [process.env.STRIPE_BUSINESS_PRICE_ID]: { tier: "business" },
  [process.env.STRIPE_ENTERPRISE_PRICE_ID]: { tier: "enterprise" },
};

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  await dbConnect();

  const data = event.data.object;

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const customer = await stripe.customers.retrieve(data.customer);
        const user = await User.findOne({ email: customer.email });
        if (!user) break;

        const item = data.items.data[0];
        const tierInfo = tierMap[item.price.id];
        if (!tierInfo) break;

        user.tier = tierInfo.tier;
        user.stripeSubscriptionId = data.id;
        await user.save();
        break;
      }

      case "checkout.session.completed": {
        const customer = await stripe.customers.retrieve(data.customer);
        const user = await User.findOne({ email: customer.email });
        if (!user) break;

        const units = Number(data.metadata?.creditUnits);
        const credits = units / 100;
        const newCreditAmount = credits + user.credit;
        user.credit = newCreditAmount;
        await user.save();

        break;
      }

      case "customer.subscription.deleted": {
        const customer = await stripe.customers.retrieve(data.customer);
        const user = await User.findOne({ email: customer.email });
        if (!user) break;

        user.tier = "free";
        user.stripeSubscriptionId = null;
        await user.save();
        break;
      }

      default:
        break;
    }

    return new NextResponse("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Webhook handling error:", err);
    return NextResponse.json(
      { error: "Webhook handling error" },
      { status: 500 }
    );
  }
}
