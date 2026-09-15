import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/lib/repo";

// POST /api/customers/pay
// Record payment in Supabase, update booking/customer status
export async function POST(req: NextRequest) {
  try {
    const { customerId, bookingId, amount, type, method, notes } = await req.json();

    if (!customerId || !amount) {
      return NextResponse.json({ error: "customerId and amount are required" }, { status: 400 });
    }

    const formattedAmount = typeof amount === "number" ? `$${amount.toFixed(2)}` : amount;

    const payment = (await repo.create("payments", {
      customerId,
      bookingId: bookingId || null,
      amount: formattedAmount,
      type: type || "payment",
      status: "paid",
      stripePaymentIntentId: method ? `manual:${method}` : null,
    })) as any;

    if (bookingId) {
      try {
        const booking = (await repo.get("bookings", bookingId)) as any;
        if (booking) {
          await repo.update("bookings", bookingId, {
            paymentStatus: "PAID",
            status: booking.status === "PAYMENT_PENDING" ? "CONFIRMED" : booking.status,
            balanceDue: "$0.00",
          });
        }
      } catch (err: any) {
        console.error("[customer pay] Booking update error:", err.message);
      }
    }

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error: any) {
    console.error("[api/customers/pay]", error);
    return NextResponse.json({ error: error.message || "Failed to record payment" }, { status: 500 });
  }
}
