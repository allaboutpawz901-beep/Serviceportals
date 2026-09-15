import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { repo } from "@/lib/repo";

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
  return _stripe;
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json({ received: true, note: "STRIPE_WEBHOOK_SECRET not set" });
  }

  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e: any) {
    return NextResponse.json({ error: `Webhook signature failed: ${e.message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const type = session.metadata?.type;

      if (type === "booking_deposit" || session.metadata?.bookingId) {
        const bookingId = session.metadata?.bookingId;
        const customerId = session.metadata?.customerId;
        const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : "";

        // 1. Confirm the booking
        if (bookingId) {
          await repo.update("bookings", bookingId, {
            status: "CONFIRMED",
            paymentStatus: "DEPOSIT_PAID",
            stripePaymentIntentId: paymentIntentId,
          });
        }

        // 2. Update payment record
        try {
          const payments = (await repo.list("payments")) as any[];
          const paymentRecord = payments.find((p) => p.stripeCheckoutSessionId === session.id);
          if (paymentRecord) {
            await repo.update("payments", paymentRecord.id, {
              status: "paid",
              stripePaymentIntentId: paymentIntentId,
            });
          } else {
            await repo.create("payments", {
              bookingId: bookingId || null,
              customerId: customerId || null,
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId: paymentIntentId,
              amount: session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : "$25.00",
              type: "deposit",
              status: "paid",
            });
          }
        } catch (err: any) {
          console.error("[stripe webhook] Payment record update error:", err.message);
        }
      }
    } else if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      try {
        const payments = (await repo.list("payments")) as any[];
        const payment = payments.find((p) => p.stripePaymentIntentId === intent.id);
        if (payment) {
          await repo.update("payments", payment.id, { status: "paid" });
        }
      } catch (err: any) {
        console.error("[stripe webhook] Payment intent update error:", err.message);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      try {
        const payments = (await repo.list("payments")) as any[];
        const payment = payments.find((p) => p.stripePaymentIntentId === intent.id);
        if (payment) {
          await repo.update("payments", payment.id, { status: "failed" });
        }
      } catch (err: any) {
        console.error("[stripe webhook] Payment failed update error:", err.message);
      }
    } else if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      try {
        const payments = (await repo.list("payments")) as any[];
        const payment = payments.find((p) => p.stripePaymentIntentId === charge.payment_intent);
        if (payment) {
          await repo.update("payments", payment.id, { status: "refunded" });
        }
      } catch (err: any) {
        console.error("[stripe webhook] Refund update error:", err.message);
      }
    }
  } catch (e: any) {
    console.error("[stripe webhook error]", e);
  }

  return NextResponse.json({ received: true });
}
