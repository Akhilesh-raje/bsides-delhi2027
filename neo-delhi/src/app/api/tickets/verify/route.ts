import { z } from "zod";
import { sendTicketRecordEmail } from "@/lib/email";
import { fetchOrderDetails, fetchPaymentDetails, verifyRazorpayPaymentSignature } from "@/lib/razorpay";
import { createAdminClient } from "@/lib/supabase/server";
import { buildTicketRecord } from "@/lib/tickets";
import { Attendee } from "@/lib/attendee";

const Body = z.object({
  razorpay_order_id: z.string().min(1).max(64),
  razorpay_payment_id: z.string().min(1).max(64),
  razorpay_signature: z.string().min(1).max(256),
});

// Verifies a completed checkout, issues the ticket once per order, and emails it.
// shortcut: if the buyer closes the tab before this runs, no ticket is issued; add a Razorpay webhook calling the same logic.
export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request" }, { status: 400 });
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = parsed.data;

  if (!verifyRazorpayPaymentSignature({ orderId, paymentId, signature })) {
    return Response.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const db = createAdminClient();
  const existing = await db.from("tickets").select("ticket_number, qr_data_url").eq("order_id", orderId).maybeSingle();
  if (existing.data) return Response.json({ ticketNumber: existing.data.ticket_number, qrDataUrl: existing.data.qr_data_url });

  try {
    const [order, payment] = await Promise.all([fetchOrderDetails(orderId), fetchPaymentDetails(paymentId)]);
    if (payment.order_id !== orderId || !["captured", "authorized"].includes(payment.status)) {
      return Response.json({ error: "Payment is not complete." }, { status: 402 });
    }
    const attendee = Attendee.parse(order.notes);
    const record = await buildTicketRecord({
      tierId: attendee.tierId,
      attendee,
      orderId,
      paymentId,
      amountPaid: Number(order.amount) / 100,
    });

    const { error } = await db.from("tickets").insert(record);
    if (error) {
      // 23505 = unique order_id: a parallel request already issued this ticket.
      if (error.code === "23505") {
        const again = await db.from("tickets").select("ticket_number, qr_data_url").eq("order_id", orderId).single();
        return Response.json({ ticketNumber: again.data?.ticket_number, qrDataUrl: again.data?.qr_data_url });
      }
      throw error;
    }

    const mail = await sendTicketRecordEmail(record);
    if (!mail.success) console.error("[tickets/verify] email failed for", record.ticket_number, mail.error);

    return Response.json({ ticketNumber: record.ticket_number, qrDataUrl: record.qr_data_url });
  } catch (err) {
    console.error("[tickets/verify] payment", paymentId, "order", orderId, err);
    return Response.json(
      { error: `Payment received but your ticket could not be issued. Email us with order ID ${orderId}.` },
      { status: 500 },
    );
  }
}
