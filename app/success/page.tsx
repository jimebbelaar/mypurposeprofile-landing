"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/meta-pixel";
import { motion } from "framer-motion";
import { CheckCircle, Mail, ArrowRight, Inbox } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  useEffect(() => {
    if (redirectStatus === "succeeded") {
      // Track successful purchase
      trackEvent("Purchase", {
        value: 27.0,
        currency: "USD",
        content_name: "ADHD Identity Method",
        content_type: "product",
        payment_intent: paymentIntent,
      });
    }
  }, [redirectStatus, paymentIntent]);

  if (redirectStatus !== "succeeded") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-adhd-red text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold mb-4">Payment Not Completed</h1>
          <p className="text-gray-400 mb-8">
            Your payment was not completed. Please try again.
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-adhd-yellow to-adhd-orange text-black font-bold px-8 py-4 rounded-xl"
            >
              Return to Homepage
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-adhd-yellow/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-adhd-green/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative z-10 text-center max-w-2xl px-4"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-adhd-green rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-5xl font-black mb-4">
            <span className="gradient-text">Success!</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Your purchase was completed successfully 🎉
          </p>
        </motion.div>

        {/* Check Email Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-2xl p-8 mb-8"
        >
          <div className="w-16 h-16 bg-adhd-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-adhd-yellow" />
          </div>

          <h2 className="text-3xl font-bold mb-4 text-adhd-yellow">
            Check Your Email!
          </h2>

          <p className="text-lg text-gray-300 mb-6">
            We've sent everything you need to get started to your email address.
          </p>
        </motion.div>

        {/* Email Provider Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <p className="text-gray-400 mb-4">Open your email provider:</p>

          <div className="flex justify-center gap-4 flex-wrap">
            <motion.a
              href="https://mail.google.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition flex items-center gap-2"
            >
              <Inbox className="w-5 h-5" />
              Gmail
            </motion.a>

            <motion.a
              href="https://outlook.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition flex items-center gap-2"
            >
              <Inbox className="w-5 h-5" />
              Outlook
            </motion.a>

            <motion.a
              href="https://mail.yahoo.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition flex items-center gap-2"
            >
              <Inbox className="w-5 h-5" />
              Yahoo
            </motion.a>
          </div>
        </motion.div>

        {/* Support Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 space-y-4"
        >
          <div className="p-4 bg-adhd-yellow/10 rounded-xl border border-adhd-yellow/30">
            <p className="text-sm text-adhd-yellow">
              <strong>💡 Didn't receive the email?</strong> Check your spam
              folder or wait a few minutes. Emails typically arrive within 5
              minutes.
            </p>
          </div>

          <p className="text-sm text-gray-500">Order ID: {paymentIntent}</p>

          <p className="text-sm text-gray-400">
            Need help? Contact support at{" "}
            <a
              href="mailto:info@adhdharmony.com"
              className="text-adhd-yellow hover:underline"
            >
              info@adhdharmony.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adhd-yellow"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
