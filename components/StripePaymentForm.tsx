"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import { trackEvent } from "@/lib/meta-pixel";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  X,
  Lock,
  CreditCard,
  Loader2,
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
  const [checkoutInstance, setCheckoutInstance] = useState<any>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const [priceInfo, setPriceInfo] = useState<PriceInfo>({
    price: "47",
    currency: "USD",
    productName: "MyPurposeProfile",
    originalPrice: "541",
  });
  const [priceLoading, setPriceLoading] = useState(true);

  // Check if component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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
          setPriceInfo({
            ...data,
            price: parseFloat(data.price).toFixed(0),
            originalPrice: data.originalPrice
              ? parseFloat(data.originalPrice).toFixed(0)
              : "541",
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
        throw new Error("Failed to create checkout session");
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
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
      closeModal();
    }
  };

  const handleOpenPayment = async () => {
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
  };

  // Emit payment modal state changes
  useEffect(() => {
    paymentModalEvents.emit(showPayment);
  }, [showPayment]);

  // IMPROVED body scroll locking specifically for iOS
  useEffect(() => {
    if (!showPayment) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    // Store original styles
    const originalBodyStyle = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    const originalHtmlStyle = {
      overflow: html.style.overflow,
      position: html.style.position,
    };

    // Apply iOS-friendly scroll lock
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    // Additional iOS fix - prevent touchmove on the overlay
    const preventScroll = (e: TouchEvent) => {
      if (e.target === e.currentTarget) {
        e.preventDefault();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("touchmove", preventScroll);

      // Restore original styles
      Object.assign(body.style, originalBodyStyle);
      Object.assign(html.style, originalHtmlStyle);

      // Restore scroll position
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

  // Modal content to be rendered via portal
  const modalContent = showPayment && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        style={{
          position: "fixed",
          isolation: "isolate",
        }}
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
          style={{
            maxHeight: "90dvh",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closeModal}
            className="sticky top-4 right-4 z-50 p-2 rounded-full bg-white/90 hover:bg-gray-100 transition-colors shadow-lg ml-auto block mr-4 mt-4"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="p-4">
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-gray-500" size={32} />
              </div>
            )}

            <div
              id="checkout-container"
              ref={checkoutRef}
              className="min-h-[600px]"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <>
      {/* Main CTA Button */}
      <div className="glass-effect p-8 rounded-2xl border border-mpp-yellow/30 glow-yellow">
        {priceLoading ? (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-700 rounded mb-4"></div>
            <div className="h-16 bg-gray-700 rounded mb-4"></div>
          </div>
        ) : (
          <>
            {/* Price Display Section */}
            <div className="mb-6">
              {percentageOff && (
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                    className="bg-gradient-to-r from-mpp-red to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg"
                  >
                    <TrendingDown className="w-4 h-4" />
                    LIMITED TIME: {percentageOff}% OFF
                  </motion.div>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                {priceInfo.originalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Total value:</span>
                    <span className="text-gray-600 line-through text-xl font-medium">
                      ${priceInfo.originalPrice}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="text-mpp-yellow">
                    <span className="text-5xl gradient-text font-black">$</span>
                    <span className="text-5xl gradient-text font-black">
                      {priceInfo.price}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 mt-1">
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
              className="w-full bg-gradient-to-r from-mpp-yellow to-mpp-orange text-white font-bold text-xl py-6 rounded-xl transition-all shadow-2xl hover:shadow-mpp-yellow/30 disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-mpp-yellow via-mpp-orange to-mpp-yellow bg-size-200 animate-gradient-x opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-700 mt-4 items-center text-center">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-mpp-green flex-shrink-0" />
                <span>100% money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-mpp-green flex-shrink-0" />
                <span>Instant access (start in 2 min)</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-mpp-green flex-shrink-0" />
                <span>Secure payment by Stripe</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Render modal via Portal */}
      {mounted &&
        typeof window !== "undefined" &&
        modalContent &&
        createPortal(modalContent, document.getElementById("modal-root")!)}

      {/* Gradient animation styles */}
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
