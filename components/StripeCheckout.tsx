// ================
// components/StripeCheckout.tsx
// ================
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/meta-pixel";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function StripeCheckout() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    // Track checkout initiation
    trackEvent("InitiateCheckout", {
      value: 27.0,
      currency: "USD",
      content_name: "ADHD Identity Method",
      content_category: "Digital Product",
    });

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error("Stripe error:", error);
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-effect p-8 rounded-2xl border border-adhd-yellow/30 glow-yellow">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <span className="text-gray-500 line-through text-2xl">$1,035</span>
          <div className="text-5xl font-bold text-adhd-yellow">$27</div>
        </div>
        <div className="bg-adhd-red text-white px-4 py-2 rounded-full font-bold">
          97% OFF TODAY
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-gradient-to-r from-adhd-yellow to-adhd-orange text-black font-bold text-xl py-6 rounded-xl transition-all animate-pulse-slow mb-4 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Yes, I Want This Now →"}
      </motion.button>

      <div className="flex flex-col gap-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-adhd-green" />
          <span>30-day money-back guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-adhd-green" />
          <span>Instant access (start in 2 min)</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-adhd-green" />
          <span>Made by ADHDer for ADHDers</span>
        </div>
      </div>
    </div>
  );
}
