/**
 * Email Service — abstraction layer.
 *
 * EMAIL_PROVIDER=none      → development (logs to console, no real email)
 * EMAIL_PROVIDER=sendgrid  → production (fill in SENDGRID_API_KEY in .env)
 *
 * Does NOT pretend an email was sent if the service is not configured.
 */

const emailProvider = process.env.EMAIL_PROVIDER || "none";

async function sendBookingConfirmation(booking) {
  if (emailProvider === "none") {
    console.log(`[EmailService] NOT CONFIGURED — would send confirmation to ${booking.email}`);
    console.log(`[EmailService] Booking: ${booking.bookingReference}`);
    return { sent: false, reason: "Email service not configured. Set EMAIL_PROVIDER in .env." };
  }

  if (emailProvider === "sendgrid") {
    // TODO: const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to: booking.email, from: process.env.EMAIL_FROM, ... });
    throw new Error("SendGrid not yet configured. Fill in SENDGRID_API_KEY in .env.");
  }

  return { sent: false, reason: "Unknown email provider." };
}

module.exports = { sendBookingConfirmation };
