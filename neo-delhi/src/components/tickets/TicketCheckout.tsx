"use client";

import { useRef, useState } from "react";
import { formatPriceINR, TICKET_TIERS_LIST, type TicketTier } from "@/types/ticket";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayCtor = new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void };
type State =
  | { step: "form" }
  | { step: "busy"; msg: string }
  | { step: "error"; msg: string }
  | { step: "done"; ticketNumber: string; qrDataUrl: string };

function loadCheckout(): Promise<RazorpayCtor> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Checkout failed to load")));
    s.onerror = () => reject(new Error("Checkout failed to load"));
    document.body.appendChild(s);
  });
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data as T;
}

const field = "w-full rounded-lg border border-gunmetal bg-surface px-3 py-2.5 text-sm text-silver outline-none focus:border-signal";

export function TicketCheckout() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [tier, setTier] = useState<TicketTier | null>(null);
  const [state, setState] = useState<State>({ step: "form" });

  const open = (t: TicketTier) => {
    setTier(t);
    setState({ step: "form" });
    dialog.current?.showModal();
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tier) return;
    const form = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    try {
      setState({ step: "busy", msg: "Starting secure payment…" });
      const [order, Razorpay] = await Promise.all([
        post<{ orderId: string; amount: number; currency: string; keyId: string; tierName: string }>("/api/tickets/order", { ...form, tierId: tier.id }),
        loadCheckout(),
      ]);
      const rzp = new Razorpay({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "BSides Delhi 2027",
        description: order.tierName,
        prefill: { name: form.fullName, email: form.email, contact: form.phone },
        theme: { color: "#D62E42" },
        modal: { ondismiss: () => setState({ step: "form" }) },
        handler: async (resp: RazorpayResponse) => {
          try {
            setState({ step: "busy", msg: "Issuing your pass…" });
            const t = await post<{ ticketNumber: string; qrDataUrl: string }>("/api/tickets/verify", resp);
            setState({ step: "done", ...t });
          } catch (err) {
            setState({ step: "error", msg: (err as Error).message });
          }
        },
      });
      rzp.on("payment.failed", () => setState({ step: "error", msg: "Payment failed. You have not been charged." }));
      rzp.open();
    } catch (err) {
      setState({ step: "error", msg: (err as Error).message });
    }
  }

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {TICKET_TIERS_LIST.map((t) => (
          <li
            key={t.id}
            className={`flex flex-col rounded-card border bg-obsidian/75 p-6 backdrop-blur-md ${t.highlighted ? "border-signal shadow-[0_0_40px_rgba(214,46,66,0.2)]" : "border-gunmetal/70"}`}
          >
            {t.badge && <p className="mb-2 font-mono text-[10px] tracking-widest text-signal uppercase">{t.badge}</p>}
            <h3 className="font-display text-lg font-bold text-silver">{t.name}</h3>
            <p className="my-3 font-display text-3xl font-bold text-silver">
              {formatPriceINR(t.price)}
              {t.originalPrice && <s className="ml-2 text-sm font-normal text-muted">{formatPriceINR(t.originalPrice)}</s>}
            </p>
            <ul className="mb-6 flex-1 space-y-1.5 text-xs text-muted">
              {t.featuresList.map((f) => <li key={f}>— {f}</li>)}
            </ul>
            <button
              onClick={() => open(t)}
              disabled={!t.available || t.soldOut}
              className="rounded-button bg-signal px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_24px_rgba(214,46,66,0.45)] disabled:opacity-50"
            >
              {t.soldOut ? "Sold out" : "Get pass →"}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        data-lenis-prevent
        aria-labelledby="checkout-title"
        className="m-auto w-[min(92vw,440px)] rounded-card border border-gunmetal bg-obsidian p-0 text-silver backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="p-7">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <p className="font-mono text-xs text-signal uppercase">Metro gate · Checkout</p>
              <h3 id="checkout-title" className="font-display text-xl font-bold">{tier?.name}</h3>
              {tier && <p className="text-sm text-muted">{formatPriceINR(tier.price)}</p>}
            </div>
            <button onClick={() => dialog.current?.close()} aria-label="Close" className="text-muted hover:text-silver">✕</button>
          </div>

          {state.step === "done" ? (
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL from our API */}
              <img src={state.qrDataUrl} alt={`QR pass for ticket ${state.ticketNumber}`} className="mx-auto mb-4 w-56 rounded-lg" />
              <p className="font-mono text-lg text-signal">{state.ticketNumber}</p>
              <p className="mt-2 text-sm text-muted">You&apos;re in. A copy is on its way to your inbox. Show this QR at the gate.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input name="fullName" required minLength={2} maxLength={100} placeholder="Full name" autoComplete="name" className={field} aria-label="Full name" />
              <input name="email" type="email" required placeholder="Email" autoComplete="email" className={field} aria-label="Email" />
              <input name="phone" type="tel" required pattern="\+?[0-9 \-]{8,16}" placeholder="Phone (+91…)" autoComplete="tel" className={field} aria-label="Phone" />
              <input name="organization" maxLength={120} placeholder={tier?.id === "student" ? "College" : "Organisation (optional)"} className={field} aria-label="Organisation" />
              <div className="grid grid-cols-2 gap-3">
                <select name="tshirtSize" required defaultValue="M" className={field} aria-label="T-shirt size">
                  {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <select name="dietaryPreference" required defaultValue="no-preference" className={field} aria-label="Food preference">
                  <option value="no-preference">Any food</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-veg</option>
                  <option value="vegan">Vegan</option>
                  <option value="jain">Jain</option>
                </select>
              </div>
              {state.step === "error" && <p role="alert" className="text-sm text-signal">{state.msg}</p>}
              <button
                type="submit"
                disabled={state.step === "busy"}
                className="w-full rounded-button bg-signal py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {state.step === "busy" ? state.msg : "Pay securely with Razorpay"}
              </button>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
