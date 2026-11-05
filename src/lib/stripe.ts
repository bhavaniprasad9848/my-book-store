import Stripe from "stripe";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  // Ignore the "sk_test_..." placeholder copied from .env.example.
  return /^sk_(test|live)_[A-Za-z0-9]{10,}$/.test(key);
}
