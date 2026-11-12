import cron from "node-cron";
import Booking from "../models/booking.model.js";
import { sendTrekReminder } from "../services/email.js";
import { env } from "../config/env.js";

const dateInTz = (d) => d.toLocaleDateString("en-CA", { timeZone: env.timezone }); // YYYY-MM-DD

/** Email confirmed bookings whose trek date falls within the reminder window. */
export const runTrekReminders = async () => {
  const now = new Date();
  const until = new Date(now.getTime() + env.email.reminderHours * 3600 * 1000);
  const bookings = await Booking.find({
    status: "Confirmed",
    reminderSentAt: { $exists: false },
    date: { $gte: dateInTz(now), $lte: dateInTz(until) },
  }).populate("packageDetails");

  for (const b of bookings) {
    // mark first so a crash mid-loop never double-sends
    await Booking.updateOne({ _id: b._id, reminderSentAt: { $exists: false } }, { reminderSentAt: new Date() });
    sendTrekReminder(b, b.packageDetails);
  }
  if (bookings.length) console.log(`[reminders] sent ${bookings.length} trek reminder(s)`);
};

export const startJobs = () => {
  cron.schedule("0 * * * *", () => runTrekReminders().catch((e) => console.warn("[reminders] failed:", e.message)), { timezone: env.timezone });
};
