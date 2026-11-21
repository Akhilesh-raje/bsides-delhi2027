import { Attendee } from "@/lib/attendee";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay";
import { getTicketTier } from "@/types/ticket";

// Creates a Razorpay order. Price always comes from the server-side tier table, never the client.
export async function POST(request: Request) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return Response.json({ error: "Ticketing is not configured yet." }, { status: 503 });
  }
  const parsed = Attendee.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the form fields." }, { status: 400 });

  const a = parsed.data;
  const tier = getTicketTier(a.tierId);
  // shortcut: tier `limit` is not enforced against sold count; add a count check before high-demand launches.
  if (!tier || !tier.available || tier.soldOut) return Response.json({ error: "This ticket is not available." }, { status: 409 });

  try {
    const order = await createRazorpayOrder({
      amountInPaise: tier.priceInPaise,
      receipt: `nd27_${Date.now().toString(36)}`,
      // The attendee lives on the order so verification reads it from Razorpay, not from the browser.
      notes: { ...a },
    });
    return Response.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: getRazorpayKeyId(), tierName: tier.name });
  } catch (err) {
    console.error("[tickets/order]", err);
    return Response.json({ error: "Could not start payment. Try again." }, { status: 502 });
  }
}
