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
  ShieldCheck,
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
  const [viewportHeight, setViewportHeight] = useState(0);

  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    price: "27",
    currency: "USD",
    productName: "ADHD Identity Method",
    originalPrice: "1035",
  });
  const [priceLoading, setPriceLoading] = useState(true);

  // Initialize Stripe
  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!).then(setStripe);
  }, []);

  // Handle viewport height for mobile devices
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visualViewport for better mobile support
      const vh = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(vh);
      // Set CSS variable for use in styles
      document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
    };

    updateViewportHeight();

    // Listen for viewport changes (keyboard open/close, orientation change)
    window.addEventListener("resize", updateViewportHeight);
    window.visualViewport?.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.visualViewport?.removeEventListener(
        "resize",
        updateViewportHeight
      );
      window.removeEventListener("orientationchange", updateViewportHeight);
    };
  }, []);

  // Fetch price information on component mount
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
      } catch (error) {
        console.error("Failed to fetch price info:", error);
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

      const checkout = await stripe.initEmbeddedCheckout({
        clientSecret,
      });

      setCheckoutInstance(checkout);

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
    previousActiveElement.current = document.activeElement;

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
      checkoutInstance.destroy();
      setCheckoutInstance(null);
    }

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

    // Store current scroll position
    const scrollY = window.scrollY;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPosition = window.getComputedStyle(document.body).position;

    // Prevent body scroll
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    // Add class for iOS specific handling
    document.documentElement.classList.add("modal-open");

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalStyle;
      document.body.style.position = originalPosition;
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.documentElement.classList.remove("modal-open");
      window.scrollTo(0, scrollY);
    };
  }, [showPayment]);

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
      {/* Main CTA Button */}
      <div className="glass-effect p-6 sm:p-8 rounded-2xl border border-adhd-yellow/30 glow-yellow">
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
                    className="bg-gradient-to-r from-adhd-red to-red-600 text-white px-3 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg"
                  >
                    <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    LIMITED TIME: {percentageOff}% OFF
                  </motion.div>
                </div>
              )}

              {/* Price Container */}
              <div className="flex flex-col items-center gap-2">
                {/* Original Price */}
                {priceInfo.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-xs sm:text-sm">
                      Total value:
                    </span>
                    <span className="text-gray-400 line-through text-lg sm:text-xl font-medium">
                      ${priceInfo.originalPrice}
                    </span>
                  </div>
                )}

                {/* Current Price */}
                <div className="flex items-center gap-3">
                  <div className="text-adhd-yellow">
                    <span className="text-5xl sm:text-6xl gradient-text font-black">
                      ${priceInfo.price}
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
              className="w-full bg-gradient-to-r from-adhd-yellow to-adhd-orange text-black font-bold text-lg sm:text-xl py-5 sm:py-6 rounded-xl transition-all shadow-2xl hover:shadow-adhd-yellow/30 disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group touch-manipulation"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-adhd-yellow via-adhd-orange to-adhd-yellow bg-size-200 animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
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
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-300 mt-4 items-center text-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-adhd-green flex-shrink-0" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-adhd-green flex-shrink-0" />
                <span>Instant access (start in 2 min)</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-adhd-green flex-shrink-0" />
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
            className="payment-modal-overlay"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
            onClick={closeModal}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="payment-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Positioned lower to avoid topbar overlap */}
              <div className="payment-modal-header">
                <button
                  onClick={closeModal}
                  className="close-button"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>

                <div className="header-content">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-adhd-green" />
                    <h2
                      id="modal-title"
                      className="text-xl sm:text-2xl font-bold gradient-text"
                    >
                      Secure Checkout
                    </h2>
                  </div>
                  {youSave && (
                    <div className="text-xs sm:text-sm text-adhd-green bg-adhd-green/10 px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <span>You save ${youSave}!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout Container */}
              <div className="payment-modal-body">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2
                      className="animate-spin text-adhd-yellow mb-3"
                      size={32}
                    />
                    <span className="text-gray-400 text-sm sm:text-base">
                      Loading secure checkout...
                    </span>
                  </div>
                )}

                {error && (
                  <div className="mx-4 mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle
                        className="text-red-500 mr-2 mt-0.5 flex-shrink-0"
                        size={20}
                      />
                      <div className="flex-1">
                        <p className="text-red-400 font-medium text-sm sm:text-base">
                          Payment Error
                        </p>
                        <p className="text-red-300 text-xs sm:text-sm mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRetry}
                      className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors touch-manipulation"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                <div
                  id="checkout-container"
                  ref={checkoutRef}
                  className="checkout-container"
                >
                  {/* Embedded checkout will be mounted here */}
                </div>
              </div>

              {/* Footer */}
              <div className="payment-modal-footer">
                <div className="flex items-center justify-center text-xs sm:text-sm text-gray-400">
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-adhd-green" />
                  Secure checkout powered by Stripe
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Apple Pay, Google Pay, and all major cards accepted
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced styles for mobile optimization */}
      <style jsx global>{`
        /* Use CSS custom property for viewport height */
        :root {
          --vh: 1vh;
          --safe-area-inset-top: env(safe-area-inset-top, 0px);
          --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        }

        /* Prevent scroll when modal is open */
        .modal-open {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }

        /* Modal overlay - full screen coverage */
        .payment-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          overscroll-behavior: contain;
          touch-action: none;
        }

        /* Modal container */
        .payment-modal-container {
          position: relative;
          background: #000;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 203, 8, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          width: 100%;
          max-width: 42rem;
          height: calc(var(--vh, 1vh) * 100);
          max-height: calc(var(--vh, 1vh) * 90);
          margin: calc(var(--vh, 1vh) * 5) 1rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Mobile specific adjustments */
        @media (max-width: 640px) {
          .payment-modal-container {
            height: calc(
              var(--vh, 1vh) * 100 - var(--safe-area-inset-top) -
                var(--safe-area-inset-bottom)
            );
            max-height: calc(
              var(--vh, 1vh) * 100 - var(--safe-area-inset-top) -
                var(--safe-area-inset-bottom)
            );
            margin: 0;
            border-radius: 0;
            width: 100%;
            max-width: 100%;
          }

          .payment-modal-overlay {
            padding: 0;
          }
        }

        /* Header with proper spacing from top */
        .payment-modal-header {
          position: relative;
          flex-shrink: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 203, 8, 0.1),
            rgba(255, 166, 0, 0.1)
          );
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          padding-top: calc(1.5rem + var(--safe-area-inset-top));
        }

        @media (min-width: 640px) {
          .payment-modal-header {
            padding: 2rem;
            padding-top: 3.5rem; /* Extra space for desktop sticky topbar */
          }
        }

        .close-button {
          position: absolute;
          top: calc(1rem + var(--safe-area-inset-top));
          right: 1rem;
          padding: 0.5rem;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        @media (min-width: 640px) {
          .close-button {
            top: 2.5rem; /* Adjusted for desktop topbar */
            right: 1.5rem;
          }
        }

        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .close-button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(255, 203, 8, 0.5);
        }

        .header-content {
          padding-right: 3rem;
        }

        /* Body section */
        .payment-modal-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          padding: 1rem;
        }

        @media (min-width: 640px) {
          .payment-modal-body {
            padding: 1.5rem;
          }
        }

        /* Checkout container */
        .checkout-container {
          min-height: 400px;
        }

        @media (min-width: 640px) {
          .checkout-container {
            min-height: 500px;
          }
        }

        /* Footer */
        .payment-modal-footer {
          flex-shrink: 0;
          padding: 1rem;
          padding-bottom: calc(1rem + var(--safe-area-inset-bottom));
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          background: #000;
        }

        @media (min-width: 640px) {
          .payment-modal-footer {
            padding: 1.5rem;
          }
        }

        /* Gradient animation */
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

        /* Improve touch responsiveness */
        .touch-manipulation {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        /* Gradient text */
        .gradient-text {
          background: linear-gradient(135deg, #ffcb08 0%, #ffa600 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
        }

        /* Ensure Stripe iframe fills container properly */
        #checkout-container iframe {
          width: 100% !important;
          min-height: 400px;
        }

        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          .payment-modal-container {
            height: -webkit-fill-available;
          }
        }

        /* Prevent zoom on input focus on iOS */
        input,
        select,
        textarea {
          font-size: 16px !important;
        }
      `}</style>
    </>
  );
}
