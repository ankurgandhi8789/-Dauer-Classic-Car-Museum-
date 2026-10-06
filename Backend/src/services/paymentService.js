/**
 * Payment Service — abstraction layer.
 *
 * PAYMENT_PROVIDER=mock   → development / testing (no real charge)
 * PAYMENT_PROVIDER=stripe → production (fill in Stripe keys in .env)
 *
 * The interface is the same regardless of provider:
 *   processPayment(bookingRef, amount, paymentDetails) → { success, transactionId, status, error? }
 *   verifyPayment(transactionId) → { success, status }
 */

const provider = process.env.PAYMENT_PROVIDER || "mock";

// ─── MOCK PROVIDER ────────────────────────────────────────────────────────────
async function mockProcessPayment(bookingRef, amount, paymentDetails) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600));

  // Test card numbers for mock mode
  const cardNumber = (paymentDetails.cardNumber || "").replace(/\s/g, "");

  // Simulate failure for test card 4000000000000002
  if (cardNumber === "4000000000000002") {
    return {
      success: false,
      transactionId: null,
      status: "failed",
      error: "Your card was declined. Please try a different card.",
    };
  }

  // All other cards succeed in mock mode
  const transactionId = `MOCK-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return {
    success: true,
    transactionId,
    status: "paid",
    provider: "mock",
    amount,
    currency: "USD",
  };
}

async function mockVerifyPayment(transactionId) {
  return {
    success: transactionId.startsWith("MOCK-"),
    status: transactionId.startsWith("MOCK-") ? "paid" : "failed",
  };
}

// ─── STRIPE PROVIDER (stub — fill in when ready) ──────────────────────────────
async function stripeProcessPayment(bookingRef, amount, paymentDetails) {
  // TODO: import stripe and use paymentDetails.paymentMethodId
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const intent = await stripe.paymentIntents.create({ amount: amount * 100, currency: 'usd', ... });
  throw new Error("Stripe provider not yet configured. Set PAYMENT_PROVIDER=mock for development.");
}

async function stripeVerifyPayment(transactionId) {
  throw new Error("Stripe provider not yet configured.");
}

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
async function processPayment(bookingRef, amount, paymentDetails) {
  if (provider === "stripe") return stripeProcessPayment(bookingRef, amount, paymentDetails);
  return mockProcessPayment(bookingRef, amount, paymentDetails);
}

async function verifyPayment(transactionId) {
  if (provider === "stripe") return stripeVerifyPayment(transactionId);
  return mockVerifyPayment(transactionId);
}

module.exports = { processPayment, verifyPayment, provider };
