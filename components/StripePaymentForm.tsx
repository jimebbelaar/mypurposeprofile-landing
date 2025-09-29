"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/meta-pixel";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  X,
  Lock,
  CreditCard,
  Loader2,
  AlertCircle,
  TrendingDown,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Global event emitter for payment modal state
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

// Export a shared payment modal instance
let sharedSetShowPayment: ((show: boolean) => void) | null = null;

export function openPaymentModal() {
  if (sharedSetShowPayment) {
    sharedSetShowPayment(true);
  }
}

// Price information interface
interface PriceInfo {
  price: string;
  currency: string;
  productName: string;
  productDescription?: string;
  originalPrice?: string;
  priceId?: string;
}

export default function EmbeddedCheckoutForm() {
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutInstance, setCheckoutInstance] = useState<any>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [stripe, setStripe] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    price: "27",
    currency: "USD",
    productName: "ADHD Identity Method",
    originalPrice: "1035", // Default original price
  });
  const [priceLoading, setPriceLoading] = useState(true);

  // Initialize Stripe
  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!).then(setStripe);
  }, []);

  // Fetch price information on component mount
  useEffect(() => {
    const fetchPriceInfo = async () => {
      try {
        const response = await fetch("/api/get-price");
        if (response.ok) {
          const data = await response.json();
          // Ensure originalPrice is always set and remove decimals if they're .00
          setPriceInfo({
            ...data,
            price: parseFloat(data.price).toFixed(0), // Remove decimals
            originalPrice: data.originalPrice
              ? parseFloat(data.originalPrice).toFixed(0)
              : "1035", // Fallback to default if not provided
          });
        }
      } catch (error) {
        console.error("Failed to fetch price info:", error);
        // Keep default values on error
      } finally {
        setPriceLoading(false);
      }
    };

    fetchPriceInfo();
  }, []);

  // Register this instance as the shared one
  useEffect(() => {
    sharedSetShowPayment = async (show: boolean) => {
      if (show && !checkoutInstance) {
        await handleOpenPayment();
      } else {
        setShowPayment(show);
      }
    };
  }, [checkoutInstance]);

  // Initialize checkout when modal opens
  useEffect(() => {
    if (showPayment && stripe && !checkoutInstance) {
      initializeCheckout();
    }

    return () => {
      if (checkoutInstance) {
        checkoutInstance.destroy();
        setCheckoutInstance(null);
      }
    };
  }, [showPayment, stripe]);

  const initializeCheckout = async () => {
    if (!stripe) return;

    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: priceInfo.priceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          mode: "payment",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { clientSecret } = await response.json();

      // Initialize embedded checkout
      const checkout = await stripe.initEmbeddedCheckout({
        clientSecret,
      });

      setCheckoutInstance(checkout);

      // Mount checkout after a brief delay to ensure container is ready
      setTimeout(() => {
        if (checkoutRef.current) {
          checkout.mount("#checkout-container");
        }
      }, 100);

      setLoading(false);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleOpenPayment = async () => {
    // Store the currently focused element
    previousActiveElement.current = document.activeElement;

    // Track checkout initiation
    trackEvent("InitiateCheckout", {
      value: parseFloat(priceInfo.price),
      currency: priceInfo.currency,
      content_name: priceInfo.productName,
      content_category: "Digital Product",
    });

    setShowPayment(true);
  };

  const closeModal = () => {
    setShowPayment(false);

    // Destroy checkout instance when closing
    if (checkoutInstance) {
      checkoutInstance.destroy();
      setCheckoutInstance(null);
    }

    // Restore focus to the element that opened the modal
    if (previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
    }
  };

  const handleRetry = () => {
    setError(null);
    if (checkoutInstance) {
      checkoutInstance.destroy();
      setCheckoutInstance(null);
    }
    initializeCheckout();
  };

  // Emit payment modal state changes
  useEffect(() => {
    paymentModalEvents.emit(showPayment);
  }, [showPayment]);

  // Lock body scroll and handle escape key
  useEffect(() => {
    if (!showPayment) return;

    const scrollY = window.scrollY;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalStyle;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [showPayment]);

  // Calculate percentage off and savings
  const percentageOff = priceInfo.originalPrice
    ? Math.round(
        ((parseFloat(priceInfo.originalPrice) - parseFloat(priceInfo.price)) /
          parseFloat(priceInfo.originalPrice)) *
          100
      )
    : null;

  const youSave = priceInfo.originalPrice
    ? Math.round(
        parseFloat(priceInfo.originalPrice) - parseFloat(priceInfo.price)
      ) // Rounded to whole number
    : null;

  return (
    <>
      {/* Main CTA Button */}
      <div className="glass-effect p-8 rounded-2xl border border-adhd-yellow/30 glow-yellow">
        {priceLoading ? (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-700 rounded mb-4"></div>
            <div className="h-16 bg-gray-700 rounded mb-4"></div>
          </div>
        ) : (
          <>
            {/* Price Display Section */}
            <div className="mb-6">
              {/* Discount Badge */}
              {percentageOff && (
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="bg-gradient-to-r from-adhd-red to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg"
                  >
                    <TrendingDown className="w-4 h-4" />
                    LIMITED TIME: {percentageOff}% OFF
                  </motion.div>
                </div>
              )}

              {/* Price Container */}
              <div className="flex flex-col items-center gap-2">
                {/* Original Price */}
                {priceInfo.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Total value:</span>
                    <span className="text-gray-400 line-through text-xl font-medium">
                      ${priceInfo.originalPrice}
                    </span>
                  </div>
                )}

                {/* Current Price */}
                <div className="flex items-center gap-3">
                  <div className="text-adhd-yellow">
                    <span className="text-6xl gradient-text font-black ">
                      $
                    </span>
                    <span className="text-6xl gradient-text font-black ">
                      {priceInfo.price}
                    </span>
                  </div>
                </div>

                {/* Payment Note */}
                <div className="text-xs text-gray-300 mt-1">
                  One-time payment • No subscription
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenPayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-adhd-yellow to-adhd-orange text-black font-bold text-xl py-6 rounded-xl transition-all shadow-2xl hover:shadow-adhd-yellow/30 disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-adhd-yellow via-adhd-orange to-adhd-yellow bg-size-200 animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Button content */}
              <div className="relative flex items-center gap-3">
                <CreditCard className="w-6 h-6" />
                <span>{loading ? "Loading..." : "Get Instant Access"}</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </div>
            </motion.button>

            {/* Trust Badges */}
            <div className="flex flex-col gap-2 text-sm text-gray-300 mt-4 items-center text-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-adhd-green flex-shrink-0" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-adhd-green flex-shrink-0" />
                <span>Instant access (start in 2 min)</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-adhd-green flex-shrink-0" />
                <span>Secure payment by Stripe</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Embedded Checkout Modal */}
      <AnimatePresence>
        {showPayment && (
          <div
            className="fixed inset-0 bg-blue-950/90 backdrop-blur-md"
            style={{
              zIndex: 100,
            }}
          >
            <motion.div
              ref={modalRef}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute inset-0 bg-slate-900 flex flex-col overflow-hidden md:relative md:top-16 md:max-w-2xl md:mx-auto md:h-[calc(100vh-80px)] md:rounded-t-2xl md:border-t md:border-adhd-yellow/20"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                paddingTop: "50px", // Space for countdown on mobile
              }}
            >
              {/* Header */}
              <div className="sticky top-0 z-20 bg-slate-800/95 backdrop-blur-sm border-b border-adhd-yellow/20">
                <div className="p-6 bg-gradient-to-r from-adhd-yellow/5 to-adhd-orange/5">
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-adhd-yellow/50 z-30"
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
                  {/* <div className="flex items-center gap-4 mt-2">
                    <p className="text-gray-400">
                      Complete your purchase to get instant access
                    </p>
                    {youSave && (
                      <span className="text-adhd-green text-sm font-medium bg-adhd-green/10 px-2 py-1 rounded">
                        Saving ${youSave}
                      </span>
                    )}
                  </div> */}
                </div>
              </div>

              {/* Checkout Container */}
              <div className="flex-1 overflow-y-auto bg-slate-900">
                <div className="p-4 md:p-6">
                  {loading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2
                        className="animate-spin text-adhd-yellow mr-3"
                        size={32}
                      />
                      <span className="text-gray-400">
                        Loading secure checkout...
                      </span>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="text-red-500 mr-2" size={20} />
                        <div>
                          <p className="text-red-400 font-medium">
                            Payment Error
                          </p>
                          <p className="text-red-300 text-sm">{error}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRetry}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  <div
                    id="checkout-container"
                    ref={checkoutRef}
                    className="min-h-[400px]"
                  >
                    {/* Embedded checkout will be mounted here */}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-adhd-yellow/20 bg-slate-800/95 backdrop-blur-sm mt-auto">
                <div className="flex items-center justify-center text-sm text-gray-400">
                  <Lock className="w-4 h-4 mr-2 text-adhd-green" />
                  Secure checkout powered by Stripe
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Apple Pay, Google Pay, and all major cards accepted
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add gradient animation styles */}
      <style jsx>{`
        @keyframes gradient-x {
          0%,
          100% {
            transform: translateX(0%);
          }
          50% {
            transform: translateX(-50%);
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .bg-size-200 {
          background-size: 200% 200%;
        }
      `}</style>
    </>
  );
}
