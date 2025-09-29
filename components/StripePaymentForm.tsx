"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [isInitializing, setIsInitializing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const checkoutRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);
  const initializationAbortController = useRef<AbortController | null>(null);
  const mountTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destroyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stripeRef = useRef<any>(null);
  const checkoutInstanceRef = useRef<any>(null);

  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    price: "27",
    currency: "USD",
    productName: "ADHD Identity Method",
    originalPrice: "1035",
  });
  const [priceLoading, setPriceLoading] = useState(true);

  // Initialize Stripe once
  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripe = await stripePromise;
        stripeRef.current = stripe;
      } catch (error) {
        console.error("Failed to initialize Stripe:", error);
      }
    };
    initStripe();
  }, []);

  // Track component mount state
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      // Cleanup on unmount
      cleanupCheckout();
      if (mountTimeoutRef.current) {
        clearTimeout(mountTimeoutRef.current);
      }
      if (destroyTimeoutRef.current) {
        clearTimeout(destroyTimeoutRef.current);
      }
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

  // Cleanup function for checkout instance
  const cleanupCheckout = useCallback(() => {
    // Clear any pending timeouts
    if (mountTimeoutRef.current) {
      clearTimeout(mountTimeoutRef.current);
      mountTimeoutRef.current = null;
    }
    if (destroyTimeoutRef.current) {
      clearTimeout(destroyTimeoutRef.current);
      destroyTimeoutRef.current = null;
    }

    // Abort any pending initialization
    if (initializationAbortController.current) {
      initializationAbortController.current.abort();
      initializationAbortController.current = null;
    }

    // Destroy checkout instance
    if (checkoutInstanceRef.current) {
      try {
        checkoutInstanceRef.current.destroy();
      } catch (e) {
        console.error("Error destroying checkout:", e);
      }
      checkoutInstanceRef.current = null;
    }

    // Clear container
    if (checkoutRef.current) {
      checkoutRef.current.innerHTML = "";
    }

    setCheckoutInstance(null);
    setIsInitializing(false);
  }, []);

  // Initialize checkout with proper error handling and cleanup
  const initializeCheckout = useCallback(async () => {
    // Prevent concurrent initializations
    if (isInitializing || !stripeRef.current || !isMounted) {
      return;
    }

    // Cleanup any existing instance first
    cleanupCheckout();

    setIsInitializing(true);
    setLoading(true);
    setError(null);

    // Create new abort controller for this initialization
    const abortController = new AbortController();
    initializationAbortController.current = abortController;

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
        signal: abortController.signal,
      });

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { clientSecret } = await response.json();

      // Check if still mounted and not aborted
      if (!isMounted || abortController.signal.aborted) {
        return;
      }

      // Initialize embedded checkout
      const checkout = await stripeRef.current.initEmbeddedCheckout({
        clientSecret,
      });

      // Check again after async operation
      if (!isMounted || abortController.signal.aborted) {
        if (checkout) {
          checkout.destroy();
        }
        return;
      }

      // Store instance references
      checkoutInstanceRef.current = checkout;
      setCheckoutInstance(checkout);

      // Mount checkout with proper timing
      mountTimeoutRef.current = setTimeout(() => {
        if (
          isMounted &&
          checkoutRef.current &&
          checkout &&
          checkoutInstanceRef.current === checkout &&
          !abortController.signal.aborted
        ) {
          try {
            // Clear the container first
            checkoutRef.current.innerHTML = "";

            // Mount the checkout
            checkout.mount("#checkout-container");

            setLoading(false);
            setIsInitializing(false);
          } catch (mountError) {
            console.error("Error mounting checkout:", mountError);
            setError("Failed to display checkout form. Please try again.");
            setLoading(false);
            setIsInitializing(false);
            cleanupCheckout();
          }
        }
      }, 200); // Slightly longer delay for stability
    } catch (err: any) {
      // Don't show error if request was aborted
      if (err.name === "AbortError") {
        return;
      }

      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
      setIsInitializing(false);
      cleanupCheckout();
    }
  }, [isInitializing, isMounted, priceInfo.priceId, cleanupCheckout]);

  // Handle modal open
  const handleOpenPayment = useCallback(async () => {
    // Prevent opening if already open or initializing
    if (showPayment || isInitializing) {
      return;
    }

    // Store focus for accessibility
    previousActiveElement.current = document.activeElement;

    // Track event
    trackEvent("InitiateCheckout", {
      value: parseFloat(priceInfo.price),
      currency: priceInfo.currency,
      content_name: priceInfo.productName,
      content_category: "Digital Product",
    });

    setShowPayment(true);
  }, [showPayment, isInitializing, priceInfo]);

  // Handle modal close with proper cleanup
  const closeModal = useCallback(() => {
    // Cleanup checkout first
    cleanupCheckout();

    // Reset all states
    setError(null);
    setLoading(false);
    setShowPayment(false);

    // Restore focus after animation
    if (previousActiveElement.current instanceof HTMLElement) {
      setTimeout(() => {
        if (previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      }, 100);
    }
  }, [cleanupCheckout]);

  // Handle retry with proper cleanup
  const handleRetry = useCallback(() => {
    cleanupCheckout();
    setError(null);

    // Small delay before reinitializing
    setTimeout(() => {
      if (isMounted && showPayment) {
        initializeCheckout();
      }
    }, 300);
  }, [cleanupCheckout, initializeCheckout, isMounted, showPayment]);

  // Register global handler
  useEffect(() => {
    sharedSetShowPayment = (show: boolean) => {
      if (show) {
        handleOpenPayment();
      } else {
        closeModal();
      }
    };
  }, [handleOpenPayment, closeModal]);

  // Initialize checkout when modal opens
  useEffect(() => {
    if (
      showPayment &&
      stripeRef.current &&
      !isInitializing &&
      !checkoutInstance
    ) {
      // Delay initialization slightly to ensure modal is fully rendered
      const initTimeout = setTimeout(() => {
        if (showPayment && isMounted) {
          initializeCheckout();
        }
      }, 100);

      return () => clearTimeout(initTimeout);
    }
  }, [
    showPayment,
    isInitializing,
    checkoutInstance,
    initializeCheckout,
    isMounted,
  ]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!showPayment && (checkoutInstance || isInitializing)) {
      cleanupCheckout();
    }
  }, [showPayment, checkoutInstance, isInitializing, cleanupCheckout]);

  // Emit payment modal state changes
  useEffect(() => {
    paymentModalEvents.emit(showPayment);
  }, [showPayment]);

  // Handle body scroll lock and escape key
  useEffect(() => {
    if (!showPayment) return;

    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    // Lock body scroll
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    // iOS specific class
    document.documentElement.classList.add("modal-open");

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isInitializing) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      document.documentElement.classList.remove("modal-open");

      // Restore scroll position
      if (originalPosition !== "fixed") {
        window.scrollTo(0, scrollY);
      }
    };
  }, [showPayment, closeModal, isInitializing]);

  // Handle viewport changes for better mobile support
  useEffect(() => {
    const updateViewportHeight = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
    };

    updateViewportHeight();

    const handleResize = () => {
      updateViewportHeight();
    };

    window.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  const percentageOff = priceInfo.originalPrice
    ? Math.round(
        ((parseFloat(priceInfo.originalPrice) - parseFloat(priceInfo.price)) /
          parseFloat(priceInfo.originalPrice)) *
          100
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
              disabled={loading || showPayment || isInitializing}
              className="w-full bg-gradient-to-r from-adhd-yellow to-adhd-orange text-black font-bold text-lg sm:text-xl py-5 sm:py-6 rounded-xl transition-all shadow-2xl hover:shadow-adhd-yellow/30 disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group touch-manipulation"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-adhd-yellow via-adhd-orange to-adhd-yellow bg-size-200 animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>
                  {loading || isInitializing
                    ? "Loading..."
                    : "Get Instant Access"}
                </span>
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
      <AnimatePresence mode="wait">
        {showPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="payment-modal-overlay"
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-title"
            onClick={!isInitializing ? closeModal : undefined}
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
              {/* Header */}
              <div className="payment-modal-header">
                <button
                  onClick={closeModal}
                  disabled={isInitializing}
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
                </div>
              </div>

              {/* Checkout Container */}
              <div className="payment-modal-body">
                {/* Loading State */}
                {(loading || isInitializing) && !error && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2
                      className="animate-spin text-adhd-yellow mb-3"
                      size={32}
                    />
                    <span className="text-gray-400 text-sm sm:text-base">
                      Loading secure checkout...
                    </span>
                    <span className="text-gray-500 text-xs mt-2">
                      This may take a few seconds
                    </span>
                  </div>
                )}

                {/* Error State */}
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
                      disabled={isInitializing}
                      className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors touch-manipulation disabled:opacity-50"
                    >
                      {isInitializing ? "Retrying..." : "Try Again"}
                    </button>
                  </div>
                )}

                {/* Checkout Container */}
                <div
                  id="checkout-container"
                  ref={checkoutRef}
                  className="checkout-container"
                  style={{
                    visibility: loading || error ? "hidden" : "visible",
                    height: loading || error ? "0" : "auto",
                  }}
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
        /* CSS Variables */
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
          -webkit-overflow-scrolling: auto !important;
        }

        /* Modal overlay */
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
          -webkit-overflow-scrolling: auto;
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
          transform: translateZ(0); /* Force hardware acceleration */
          -webkit-transform: translateZ(0);
        }

        /* Mobile specific adjustments */
        @media (max-width: 640px) and (max-height: 800px) {
          .payment-modal-container {
            height: 100vh;
            height: 100dvh; /* Dynamic viewport height for modern browsers */
            max-height: 100vh;
            max-height: 100dvh;
            margin: 0;
            border-radius: 0;
            width: 100%;
            max-width: 100%;
          }

          .payment-modal-overlay {
            padding: 0;
          }
        }

        @media (min-width: 641px) {
          .payment-modal-container {
            height: 85vh;
            max-height: 700px;
          }
        }

        /* Header */
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
          padding-top: calc(3rem + var(--safe-area-inset-top));
          min-height: 80px;
        }

        @media (min-width: 640px) {
          .payment-modal-header {
            padding: 2rem;
            padding-top: 2.5rem;
          }
        }

        .close-button {
          position: absolute;
          top: calc(2rem + var(--safe-area-inset-top));
          right: 1rem;
          padding: 0.5rem;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (min-width: 640px) {
          .close-button {
            top: 1.5rem;
            right: 1.5rem;
          }
        }

        .close-button:hover:not(:disabled) {
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
          position: relative;
        }

        @media (min-width: 640px) {
          .payment-modal-body {
            padding: 1.5rem;
          }
        }

        /* Checkout container */
        .checkout-container {
          min-height: 400px;
          position: relative;
          width: 100%;
        }

        @media (min-width: 640px) {
          .checkout-container {
            min-height: 450px;
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

        /* Animations */
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

        /* Touch optimization */
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

        /* Stripe iframe styles */
        #checkout-container iframe {
          width: 100% !important;
          min-height: 400px;
          border: none;
          display: block;
        }

        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          .payment-modal-container {
            height: -webkit-fill-available;
            max-height: -webkit-fill-available;
          }

          .payment-modal-body {
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Prevent zoom on input focus on iOS */
        @media screen and (max-width: 640px) {
          input,
          select,
          textarea {
            font-size: 16px !important;
          }
        }

        /* Loading spinner animation */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        /* Ensure modal is above all other content */
        .payment-modal-overlay {
          isolation: isolate;
        }

        /* Prevent text selection during modal interactions */
        .payment-modal-container {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* Allow text selection in checkout iframe */
        #checkout-container {
          -webkit-user-select: auto;
          -moz-user-select: auto;
          -ms-user-select: auto;
          user-select: auto;
        }
      `}</style>
    </>
  );
}
