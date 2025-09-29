"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/meta-pixel";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Lock, CreditCard, Smartphone } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Create a global event emitter for payment modal state
export const paymentModalEvents = {
  listeners: [] as Array<(isOpen: boolean) => void>,
  subscribe(listener: (isOpen: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },
  emit(isOpen: boolean) {
    this.listeners.forEach((listener) => listener(isOpen));
  },
};

// Detect if user is on iPhone/iPad
function isAppleDevice() {
  if (typeof window === "undefined") return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isMacOS = /macintosh|mac os x/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);

  // Check for iOS devices or Safari on Mac (which supports Apple Pay)
  return isIOS || (isMacOS && isSafari);
}

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isApple] = useState(isAppleDevice());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    // Track payment attempt
    trackEvent("AddPaymentInfo", {
      value: 27.0,
      currency: "USD",
      content_name: "ADHD Identity Method",
    });

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
        receipt_email: email,
        payment_method_data: {
          billing_details: {
            name: name,
            email: email,
          },
        },
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred");
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else {
      // Payment succeeded
      trackEvent("Purchase", {
        value: 27.0,
        currency: "USD",
        content_name: "ADHD Identity Method",
        content_type: "product",
      });
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Info */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-adhd-yellow/50 transition"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-adhd-yellow/50 transition"
            placeholder="john@example.com"
          />
        </div>
      </div>

      {/* Apple Pay Notice for Apple Users */}
      {isApple && (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                Apple Pay Available
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Fast checkout with Face ID or Touch ID
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Element with Enhanced Styling */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-adhd-yellow" />
          <span className="text-sm font-medium text-gray-300">
            Payment Details
          </span>
        </div>

        {/* Custom wrapper for better Apple Pay visibility */}
        <div className="payment-element-wrapper">
          <PaymentElement
            options={{
              layout: {
                type: "accordion",
                defaultCollapsed: false,
                radios: true,
                spacedAccordionItems: true,
              },
              defaultValues: {
                billingDetails: {
                  email: email,
                  name: name,
                },
              },
              wallets: {
                applePay: "auto",
                googlePay: "auto",
              },
              // Prioritize wallet payments for Apple devices
              ...(isApple && {
                paymentMethodOrder: ["applePay", "card"],
              }),
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {message && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {message}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-gradient-to-r from-adhd-yellow to-adhd-orange text-black font-bold text-lg py-4 rounded-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Complete Purchase - $27
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Lock className="w-4 h-4" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4" />
          <span>SSL Encrypted</span>
        </div>
        <div className="flex items-center gap-1">
          <CreditCard className="w-4 h-4" />
          <span>Powered by Stripe</span>
        </div>
      </div>
    </form>
  );
}

// Export a shared payment modal instance
let sharedSetShowPayment: ((show: boolean) => void) | null = null;

export function openPaymentModal() {
  if (sharedSetShowPayment) {
    sharedSetShowPayment(true);
  }
}

export default function StripePaymentForm() {
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Register this instance as the shared one
  useEffect(() => {
    sharedSetShowPayment = async (show: boolean) => {
      if (show && !clientSecret) {
        await handleOpenPayment();
      } else {
        setShowPayment(show);
      }
    };
  }, [clientSecret]);

  const handleOpenPayment = async () => {
    setLoading(true);

    // Track checkout initiation
    trackEvent("InitiateCheckout", {
      value: 27.0,
      currency: "USD",
      content_name: "ADHD Identity Method",
      content_category: "Digital Product",
    });

    try {
      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 2700, // $27.00 in cents
        }),
      });

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Emit payment modal state changes
  useEffect(() => {
    paymentModalEvents.emit(showPayment);
  }, [showPayment]);

  // Reset scroll position when modal opens
  useEffect(() => {
    if (showPayment && modalContentRef.current) {
      modalContentRef.current.scrollTop = 0;
    }
  }, [showPayment]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showPayment) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPayment]);

  const options: StripeElementsOptions = {
    clientSecret: clientSecret!,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#FFD700",
        colorBackground: "#000000",
        colorText: "#ffffff",
        colorDanger: "#EF4444",
        fontFamily: "Inter, system-ui, sans-serif",
        borderRadius: "8px",
        spacingUnit: "6px",
        // Enhanced sizing for better Apple Pay visibility
        spacingAccordionItem: "14px",
        fontSizeBase: "16px",
        fontWeightMedium: "600",
      },
      rules: {
        // Make wallet buttons more prominent
        ".WalletButton": {
          backgroundColor: "#ffffff",
          color: "#000000",
          padding: "14px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          minHeight: "56px",
        },
        ".WalletButton--applePay": {
          backgroundColor: "#000000",
          color: "#ffffff",
          border: "1px solid #ffffff",
        },
        ".AccordionItem": {
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          borderRadius: "12px",
          marginBottom: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        ".AccordionItem--selected": {
          backgroundColor: "rgba(255, 215, 0, 0.05)",
          borderColor: "rgba(255, 215, 0, 0.3)",
        },
      },
    },
  };

  return (
    <>
      {/* Add custom CSS for payment element */}
      <style jsx global>{`
        .payment-element-wrapper {
          min-height: 300px;
        }

        /* Enhance Apple Pay button visibility */
        .payment-element-wrapper iframe {
          min-height: 400px !important;
        }

        /* Make wallet buttons more prominent on mobile */
        @media (max-width: 640px) {
          .payment-element-wrapper {
            min-height: 350px;
          }
        }
      `}</style>

      {/* Main CTA Button */}
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
          onClick={handleOpenPayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-adhd-yellow to-adhd-orange text-black font-bold text-xl py-6 rounded-xl transition-all animate-pulse-slow mb-4 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <CreditCard className="w-6 h-6" />
          {loading ? "Loading..." : "Get Instant Access →"}
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
            <span>Secure payment by Stripe</span>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && clientSecret && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center p-0 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPayment(false);
              }
            }}
          >
            <div className="min-h-screen w-full flex items-center justify-center p-4 py-20 sm:py-8">
              <motion.div
                ref={modalContentRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="relative w-full max-w-lg bg-black rounded-2xl border border-adhd-yellow/20 shadow-2xl my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 z-10 p-6 border-b border-white/10 bg-gradient-to-r from-adhd-yellow/10 to-adhd-orange/10 rounded-t-2xl">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                  <h2 className="text-2xl font-bold gradient-text">
                    Secure Checkout
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Complete your purchase to get instant access
                  </p>
                </div>

                {/* Payment Form - Scrollable Content */}
                <div className="p-6 max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-200px)] overflow-y-auto">
                  <Elements stripe={stripePromise} options={options}>
                    <PaymentForm onSuccess={() => setShowPayment(false)} />
                  </Elements>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
