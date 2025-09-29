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
  if (sharedSetShowPayment) sharedSetShowPayment(true);
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

  // dynamic vh (iOS 100vh bug fixer)
  const [vhPx, setVhPx] = useState<number | null>(null);

  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    price: "27",
    currency: "USD",
    productName: "ADHD Identity Method",
    originalPrice: "1035",
  });
  const [priceLoading, setPriceLoading] = useState(true);

  // Initialize Stripe once
  useEffect(() => {
    stripePromise.then(setStripe);
  }, []);

  // Fetch price information on mount
  useEffect(() => {
    const fetchPriceInfo = async () => {
      try {
        const response = await fetch("/api/get-price");
        if (response.ok) {
          const data = await response.json();
          setPriceInfo({
            ...data,
            price: parseFloat(data.price).toFixed(0),
            originalPrice: data.originalPrice
              ? parseFloat(data.originalPrice).toFixed(0)
              : "1035",
          });
        }
      } catch (err) {
        console.error("Failed to fetch price info:", err);
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

  // Recompute dynamic vh (handles iOS chrome/address bar & rotation)
  const computeVh = () => {
    const h = window.innerHeight; // more reliable than 100vh on iOS
    setVhPx(h);
    document.documentElement.style.setProperty("--app-vh", `${h}px`);
  };

  // Initialize checkout when modal opens
  useEffect(() => {
    if (showPayment && stripe && !checkoutInstance) {
      initializeCheckout();
    }

    return () => {
      if (checkoutInstance) {
        try {
          checkoutInstance.destroy();
        } catch {}
        setCheckoutInstance(null);
      }
    };
  }, [showPayment, stripe]);

  const initializeCheckout = async () => {
    if (!stripe) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: priceInfo.priceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          mode: "payment",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { clientSecret } = await response.json();

      const checkout = await stripe.initEmbeddedCheckout({ clientSecret });
      setCheckoutInstance(checkout);

      // Mount after container is in DOM
      setTimeout(() => {
        if (checkoutRef.current) checkout.mount("#checkout-container");
      }, 50);

      setLoading(false);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err?.message || "Something went wrong");
      setLoading(false);
    }
  };

  const handleOpenPayment = async () => {
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

    if (checkoutInstance) {
      try {
        checkoutInstance.destroy();
      } catch {}
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
      try {
        checkoutInstance.destroy();
      } catch {}
      setCheckoutInstance(null);
    }
    initializeCheckout();
  };

  // Emit modal state changes (for other components)
  useEffect(() => {
    paymentModalEvents.emit(showPayment);
  }, [showPayment]);

  // Lock body scroll + iOS overscroll/white flash fixes
  useEffect(() => {
    if (!showPayment) return;

    // compute dynamic vh and attach listeners
    computeVh();
    window.addEventListener("resize", computeVh);
    window.addEventListener("orientationchange", computeVh);

    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;
    const htmlOverscroll = document.documentElement.style.overscrollBehavior;
    const bodyOverscroll = document.body.style.overscrollBehavior;

    // hard lock the page behind the modal
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    // prevent iOS rubber-band showing white under the address bar
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", computeVh);
      window.removeEventListener("orientationchange", computeVh);
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.documentElement.style.overscrollBehavior = htmlOverscroll;
      document.body.style.overscrollBehavior = bodyOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [showPayment]);

  // Calculate savings
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
      )
    : null;

  return (
    <>
      {/* Main CTA */}
      <div className="glass-effect p-8 rounded-2xl border border-adhd-yellow/30 glow-yellow">
        {priceLoading ? (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-700 rounded mb-4"></div>
            <div className="h-16 bg-gray-700 rounded mb-4"></div>
          </div>
        ) : (
          <>
            {/* Price Display */}
            <div className="mb-6">
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

              <div className="flex flex-col items-center gap-2">
                {priceInfo.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">Total value:</span>
                    <span className="text-gray-400 line-through text-xl font-medium">
                      ${priceInfo.originalPrice}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="text-adhd-yellow">
                    <span className="text-6xl gradient-text font-black">$</span>
                    <span className="text-6xl gradient-text font-black">
                      {priceInfo.price}
                    </span>
                  </div>
                </div>

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
              <div className="absolute inset-0 bg-gradient-to-r from-adhd-yellow via-adhd-orange to-adhd-yellow bg-size-200 animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Full-viewport overlay that never shows background/white
            className="modal-backdrop fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm"
            style={{
              height: vhPx ? `${vhPx}px` : "100vh", // dynamic 100dvh
            }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
            onClick={closeModal} // close on backdrop click
          >
            <div
              className="flex h-full w-full items-stretch justify-center p-4"
              // prevent background scroll bubbling
              style={{ overscrollBehavior: "contain" }}
            >
              <motion.div
                ref={modalRef}
                initial={{ scale: 0.98, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.98, opacity: 0, y: 10 }}
                transition={{ type: "spring", damping: 26, stiffness: 300 }}
                className="bg-black rounded-2xl border border-adhd-yellow/20 shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden mt-16 md:mt-0"
                style={{
                  // ensure the modal itself fills available height cleanly on all devices
                  maxHeight: vhPx ? `${vhPx - 32}px` : undefined, // account for p-4 padding
                  // smooth scrolling inside the modal only
                  WebkitOverflowScrolling: "touch",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header (sticky, with safe-area padding) */}
                <div
                  className="sticky top-0 z-20 bg-black border-b border-white/10"
                  style={{
                    paddingTop: "max(env(safe-area-inset-top), 0px)",
                  }}
                >
                  <div className="p-6 bg-gradient-to-r from-adhd-yellow/10 to-adhd-orange/10 relative">
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
                  </div>
                </div>

                {/* Checkout Body */}
                <div
                  className="flex-1 overflow-y-auto p-6 modal-scroll"
                  style={{
                    overscrollBehavior: "contain",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
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
                    className="min-h-[520px]"
                  />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-black">
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient + small utilities */}
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
        /* Keep scrolling inside modal silky but block the page */
        .modal-scroll {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </>
  );
}
