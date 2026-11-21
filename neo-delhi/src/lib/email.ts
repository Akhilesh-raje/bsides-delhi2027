import { Resend } from "resend";
import type { TicketRecord } from "@/types/ticket";

/**
 * Global singleton Resend client
 */
let resendInstance: Resend | null = null;

function getResendClient(): Resend | null {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Resend Email] RESEND_API_KEY is not defined. Emails will be logged to console in development mode."
      );
    }
    return null;
  }

  resendInstance = new Resend(apiKey);
  return resendInstance;
}

export interface TicketEmailPayload {
  to: string;
  attendeeName: string;
  ticketNumber: string;
  tierName: string;
  orderId: string;
  amountPaid: number;
  qrDataUrl: string;
  venueName?: string;
  venueDates?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Builds the Neo-Delhi themed HTML email template for ticket confirmation.
 * Uses inline styling for maximal email client compatibility across Outlook, Gmail, and Apple Mail.
 */
function renderTicketEmailHtml(data: TicketEmailPayload): string {
  const {
    attendeeName,
    ticketNumber,
    tierName,
    orderId,
    amountPaid,
    qrDataUrl,
    venueName = "Central Convention Centre, New Delhi",
    venueDates = "February 13–14, 2027",
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your BSides Delhi 2027 Ticket // Neo-Delhi</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090D; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #E5E1DF; line-height: 1.6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08090D; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #111319; border: 1px solid #252831; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.6);">
          
          <!-- Top Neon Signal Header -->
          <tr>
            <td style="background-color: #D62E42; padding: 4px 0; text-align: center;"></td>
          </tr>

          <!-- Branding & Event Title -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: left; border-bottom: 1px solid #252831;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <span style="font-family: monospace; color: #D62E42; font-size: 14px; letter-spacing: 2px; font-weight: bold;">
                      [ ACCESS GRANTED // CREDENTIAL CONFIRMED ]
                    </span>
                    <h1 style="margin: 8px 0 4px 0; font-size: 24px; font-weight: 700; color: #E5E1DF; letter-spacing: -0.5px;">
                      BSides Delhi 2027
                    </h1>
                    <p style="margin: 0; color: #99949A; font-size: 14px;">
                      Neo-Delhi 3D Cybersecurity Conference
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <div style="background-color: rgba(214, 46, 66, 0.1); border: 1px solid #D62E42; color: #D62E42; font-family: monospace; font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: bold; display: inline-block;">
                      VERIFIED
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Attendee Greeting -->
          <tr>
            <td style="padding: 24px 32px 16px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #E5E1DF;">
                Greetings <strong style="color: #FFFFFF;">${attendeeName}</strong>,
              </p>
              <p style="margin: 0; font-size: 14px; color: #99949A;">
                Your registration for BSides Delhi 2027 is confirmed. Keep this email and QR badge accessible on your phone or printed for physical badge collection at the entrance.
              </p>
            </td>
          </tr>

          <!-- Digital Badge / QR Code Section -->
          <tr>
            <td align="center" style="padding: 12px 32px 24px 32px;">
              <table role="presentation" style="background-color: #08090D; border: 1px solid #252831; border-radius: 12px; padding: 24px; text-align: center; width: 100%;">
                <tr>
                  <td align="center">
                    <div style="background-color: #FFFFFF; padding: 12px; border-radius: 8px; display: inline-block; box-shadow: 0 0 20px rgba(157, 7, 26, 0.35);">
                      <img src="${qrDataUrl}" alt="Check-in QR Code" width="180" height="180" style="display: block; border: 0;" />
                    </div>
                    <div style="margin-top: 16px;">
                      <span style="font-family: monospace; font-size: 16px; font-weight: bold; color: #D62E42; letter-spacing: 2px;">
                        ${ticketNumber}
                      </span>
                    </div>
                    <div style="font-size: 12px; color: #99949A; margin-top: 4px;">
                      Scan at registration desk for electronic badge pickup
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ticket Particulars Grid -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" style="border-top: 1px solid #252831; border-bottom: 1px solid #252831; padding: 16px 0;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #99949A;">Ticket Tier:</td>
                  <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #E5E1DF;">
                    ${tierName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #99949A;">Order Reference:</td>
                  <td align="right" style="padding: 8px 0; font-size: 13px; font-family: monospace; color: #E5E1DF;">
                    ${orderId}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #99949A;">Amount Paid:</td>
                  <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: bold; color: #D62E42;">
                    ₹${amountPaid.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #99949A;">Event Dates:</td>
                  <td align="right" style="padding: 8px 0; font-size: 13px; color: #E5E1DF;">
                    ${venueDates}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: #99949A;">Location:</td>
                  <td align="right" style="padding: 8px 0; font-size: 13px; color: #E5E1DF;">
                    ${venueName}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Key Event Briefing -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <h3 style="font-size: 14px; color: #E5E1DF; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">
                // INSTRUCTIONS & BRIEFING
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #99949A; font-size: 13px;">
                <li style="margin-bottom: 6px;">Bring a valid government-issued photo ID (or university student ID for Student Passes).</li>
                <li style="margin-bottom: 6px;">Registration desk opens at 08:00 AM IST on both days.</li>
                <li style="margin-bottom: 6px;">Flagship CTF participants: Bring your laptop and Wi-Fi adapter.</li>
                <li style="margin-bottom: 6px;">Explore the 3D Neo-Delhi cyber journey at bsidesdelhi.in to intercept secret ARG signals!</li>
              </ul>
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="background-color: #08090D; padding: 24px 32px; border-top: 1px solid #252831; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #99949A;">
                BSides Delhi 2027 • New Delhi, India • Non-profit community conference
              </p>
              <p style="margin: 0; font-size: 11px; color: #666367;">
                Questions or ticket assistance? Reply directly to this email or ping us on Discord.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Sends a ticket confirmation email via Resend
 */
export async function sendTicketConfirmationEmail(
  payload: TicketEmailPayload
): Promise<EmailSendResult> {
  const resend = getResendClient();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "BSides Delhi 2027 <tickets@bsidesdelhi.in>";

  const html = renderTicketEmailHtml(payload);

  if (!resend) {
    console.log(
      `[MOCK EMAIL SEND] To: ${payload.to} | Ticket: ${payload.ticketNumber} | Tier: ${payload.tierName}`
    );
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [payload.to],
      subject: `[BSides Delhi 2027] Ticket Confirmed: ${payload.ticketNumber} (${payload.tierName})`,
      html,
    });

    if (error) {
      console.error("[Resend Error]", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error("[Email Exception]", err);
    return { success: false, error: err?.message || "Failed to send email" };
  }
}

/**
 * Helper to dispatch confirmation email for an issued ticket record
 */
export async function sendTicketRecordEmail(
  ticket: TicketRecord
): Promise<EmailSendResult> {
  return await sendTicketConfirmationEmail({
    to: ticket.attendee_email,
    attendeeName: ticket.attendee_name,
    ticketNumber: ticket.ticket_number,
    tierName: ticket.tier_name,
    orderId: ticket.order_id,
    amountPaid: ticket.amount_paid,
    qrDataUrl: ticket.qr_data_url || "",
  });
}
