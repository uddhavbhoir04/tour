import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.email.enabled && env.email.resendApiKey ? new Resend(env.email.resendApiKey) : null;
if (!resend) console.warn("⚠️ Email disabled (NOTIFICATION_EMAIL_ENABLED=false or RESEND_API_KEY missing)");

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const layout = (title, body) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1e293b">
  <h2 style="color:#047857">${esc(title)}</h2>
  ${body}
  <p style="color:#64748b;font-size:12px;margin-top:24px">The Roaming Birds • Sahyadri &amp; Western Ghats Treks</p>
</div>`;

const row = (k, v) => `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`;

/** Fire-and-forget send with one retry. Never throws. */
const send = async ({ to, subject, html }) => {
  if (!resend || !to) return;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { error } = await resend.emails.send({ from: env.email.from, to, subject, html });
      if (!error) return;
      console.warn("[email] send error:", error.message || error);
    } catch (err) {
      console.warn("[email] send failed:", err.message);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
};

const bookingTable = (b, pkg) => `
<table>
  ${row("Booking ID", String(b._id).slice(-8).toUpperCase())}
  ${row("Trek", pkg?.packageName || "")}
  ${row("Date", b.date)}
  ${row("City / Pickup", `${b.city}${b.pickupPoint ? " — " + b.pickupPoint : ""}`)}
  ${row("Persons", b.persons)}
  ${row("Total", `₹${b.totalPrice}`)}
  ${row("Advance", `₹${b.advanceAmount}`)}
  ${row("Payment", b.paymentStatus)}
  ${row("Status", b.status)}
</table>`;

export const sendBookingCreated = (booking, pkg, settings) => {
  const upi = settings?.upiNumber ? `<p>Pay the advance of <b>₹${booking.advanceAmount}</b> via UPI to <b>${esc(settings.upiNumber)}</b> (${esc(settings.upiHolderName || "")}) and add the UPI reference to your booking.</p>` : "";
  send({
    to: booking.email,
    subject: `Booking received — ${pkg?.packageName}`,
    html: layout("We've received your booking 🎒", `${bookingTable(booking, pkg)}${upi}`),
  });
  send({
    to: env.email.adminEmail,
    subject: `New booking: ${pkg?.packageName} (${booking.persons} pax)`,
    html: layout("New booking", `${bookingTable(booking, pkg)}<p>${esc(booking.fullName)} • ${esc(booking.phone)} • ${esc(booking.email)}</p>`),
  });
};

export const sendBookingConfirmed = (booking, pkg) =>
  send({
    to: booking.email,
    subject: `Booking confirmed — ${pkg?.packageName}`,
    html: layout("Your trek is confirmed ✅", `${bookingTable(booking, pkg)}<p>See you on the trail!</p>`),
  });

export const sendTrekReminder = (booking, pkg) =>
  send({
    to: booking.email,
    subject: `Reminder: ${pkg?.packageName} is coming up`,
    html: layout(
      "Your trek is almost here ⛰️",
      `${bookingTable(booking, pkg)}${pkg?.whatToCarry?.length ? `<p><b>What to carry:</b></p><ul>${pkg.whatToCarry.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}`
    ),
  });

export const sendContactToAdmin = (msg) =>
  send({
    to: env.email.adminEmail,
    subject: `New contact message from ${msg.name}`,
    html: layout("New contact message", `<table>${row("Name", msg.name)}${row("Email", msg.email)}${row("Phone", msg.phone || "-")}${row("Subject", msg.subject || "-")}</table><p>${esc(msg.message)}</p>`),
  });
