// ================
// components/StickyBottomCTA.tsx
// ================
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { openPaymentModal, paymentModalEvents } from "./StripePaymentForm";

export default function StickyBottomCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 5% of the page
      const scrollPercent =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercent > 15);
    };

    // Check initial scroll position
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Subscribe to payment modal state
  useEffect(() => {
    const unsubscribe = paymentModalEvents.subscribe((isOpen) => {
      setIsPaymentModalOpen(isOpen);
    });
    return unsubscribe;
  }, []);

  const handleClick = () => {
    openPaymentModal();
  };

  // Hide when payment modal is open
  const shouldShow = isVisible && !isPaymentModalOpen;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
          className="fixed bottom-0 left-0 right-0 z-40"
        >
          <div className="bg-black/95 backdrop-blur-xl border-t-2 border-adhd-yellow/50 shadow-2xl shadow-adhd-yellow/20 p-4">
            <div className="container mx-auto max-w-4xl">
              <button
                onClick={handleClick}
                data-sticky-cta="true"
                className="w-full bg-gradient-to-r from-adhd-yellow via-adhd-orange to-adhd-yellow bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-300 text-black font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-adhd-yellow/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Get Instant Access - $27</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}