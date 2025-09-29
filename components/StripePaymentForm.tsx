"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  ExpressCheckoutElement,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/meta-pixel";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, Lock, CreditCard, Smartphone } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Create a global event emitter for payment modal states
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

function PaymentForm({
  onSuccess,
  clientSecret,
}: {
  onSuccess: () => void;
  clientSecret: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isApple] = useState(isAppleDevice());
  const [useExpressCheckout, setUseExpressCheckout] = useState(false);

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

  const handleExpressCheckout = async (event: any) => {
    if (!stripe) return;

    setIsProcessing(true);
    setMessage(null);

    // Track express checkout attempt
    trackEvent("AddPaymentInfo", {
      value: 27.0,
      currency: "USD",
      content_name: "ADHD Identity Method",
      payment_method: "express",
    });

    // ExpressCheckoutElement handles its own payment confirmation
    // The event contains the expressPaymentType
    const { expressPaymentType } = event;

    // The payment confirmation is handled by the ExpressCheckoutElement itself
    // We just need to handle the result
    event.resolve({
      business: {
        name: "ADHD Identity Method",
      },
    });

    // Track successful purchase
    trackEvent("Purchase", {
      value: 27.0,
      currency: "USD",
      content_name: "ADHD Identity Method",
      content_type: "product",
      payment_method: expressPaymentType || "express",
    });

    // Success callback will be triggered by Stripe redirect
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

      {/* Express Checkout (Apple Pay, Google Pay) - Always Show First */}
      <div className="space-y-4">
        <div className="express-checkout-wrapper bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-adhd-yellow" />
            <span className="text-sm font-medium text-gray-300">
              Express Checkout
            </span>
          </div>

          <ExpressCheckoutElement
            onConfirm={handleExpressCheckout}
            options={{
              wallets: {
                applePay: "auto",
                googlePay: "auto",
              },
              buttonHeight: 48,
            }}
            onLoadError={(error) => {
              console.error("Express Checkout load error:", error);
              // Hide the express checkout section if it fails to load
              const wrapper = document.querySelector(
                ".express-checkout-wrapper"
              );
              if (wrapper) {
                wrapper.classList.add("hidden");
              }
            }}
          />

          {/* Show a message if Apple Pay should be available but isn't showing */}
          {isApple && (
            <p className="text-xs text-gray-500 mt-3">
              Apple Pay requires Safari and a configured payment method
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-gray-400">
              Or pay with card
            </span>
          </div>
        </div>

        {/* Regular Payment Element */}
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-adhd-yellow" />
            <span className="text-sm font-medium text-gray-300">
              Card Payment
            </span>
          </div>

          <div className="payment-element-wrapper">
            <PaymentElement
              options={{
                layout: "tabs",
                defaultValues: {
                  billingDetails: {
                    email: email,
                    name: name,
                  },
                },
                wallets: {
                  applePay: "never",
                  googlePay: "never",
                },
              }}
            />
          </div>
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
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

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

    // Store the currently focused element
    previousActiveElement.current = document.activeElement;

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

  const closeModal = () => {
    setShowPayment(false);

    // Restore focus to the element that opened the modal
    if (previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
    }
  };

  // Emit payment modal state changes
  useEffect(() => {
    paymentModalEvents.emit(showPayment);
  }, [showPayment]);

  // Lock body scroll and handle escape key
  useEffect(() => {
    if (!showPayment) return;

    // Save current scroll position
    const scrollY = window.scrollY;

    // Lock body scroll with proper iOS support
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleEscape);

      // Restore body scroll
      document.body.style.overflow = originalStyle;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [showPayment]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!showPayment || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Focus the close button initially
    const closeButton = modalRef.current.querySelector(
      '[aria-label="Close modal"]'
    ) as HTMLElement;
    if (closeButton) {
      closeButton.focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
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
        borderRadius: "12px",
        spacingUnit: "6px",
        fontSizeBase: "16px",
        fontWeightMedium: "600",
      },
      rules: {
        ".Tab": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "12px",
        },
        ".Tab--selected": {
          backgroundColor: "rgba(255, 215, 0, 0.05)",
          borderColor: "rgba(255, 215, 0, 0.3)",
        },
        ".Input": {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          fontSize: "16px",
          padding: "12px",
        },
        ".Input:focus": {
          borderColor: "rgba(255, 215, 0, 0.5)",
          outline: "none",
        },
        ".Label": {
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "6px",
        },
      },
    },
  };

  return (
    <>
      {/* Add custom CSS for better modal handling */}
      <style jsx global>{`
        .express-checkout-wrapper iframe {
          min-height: 60px;
          width: 100%;
        }

        .payment-element-wrapper iframe {
          min-height: 300px;
          width: 100%;
        }

        /* Ensure modal content is scrollable on mobile */
        .modal-scroll-container {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* Prevent iOS bounce effect */
        .modal-backdrop {
          position: fixed;
          overscroll-behavior: contain;
        }

        /* Fix for iOS Safari */
        @supports (-webkit-touch-callout: none) {
          .modal-content {
            /* iOS specific fixes */
            transform: translateZ(0);
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
            className="modal-backdrop fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
          >
            {/* Modal Container - Full height with proper scroll containment */}
            <div
              className="fixed inset-0 overflow-y-auto modal-scroll-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Centering wrapper with padding */}
              <div className="min-h-full flex items-center justify-center p-4">
                <motion.div
                  ref={modalRef}
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="modal-content relative w-full max-w-lg bg-black rounded-2xl border border-adhd-yellow/20 shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Fixed Header */}
                  <div className="sticky top-0 z-20 bg-black border-b border-white/10">
                    <div className="p-6 bg-gradient-to-r from-adhd-yellow/10 to-adhd-orange/10">
                      <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-adhd-yellow/50"
                        aria-label="Close modal"
                      >
                        <X className="w-6 h-6 text-white" />
                      </button>
                      <h2
                        id="modal-title"
                        className="text-2xl font-bold gradient-text pr-10"
                      >
                        Secure Checkout
                      </h2>
                      <p className="text-gray-400 mt-1">
                        Complete your purchase to get instant access
                      </p>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <Elements stripe={stripePromise} options={options}>
                      <PaymentForm
                        onSuccess={closeModal}
                        clientSecret={clientSecret}
                      />
                    </Elements>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
