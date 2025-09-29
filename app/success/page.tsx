"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/meta-pixel";
import { motion } from "framer-motion";
import { CheckCircle, Mail, Inbox, Loader2 } from "lucide-react";
import Link from "next/link";

interface SessionData {
  status: string;
  payment_status: string;
  customer_email?: string;
  customer_name?: string;
  amount_total?: number;
  currency?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  useEffect(() => {
    // Handle embedded checkout session (NEW - for Apple Pay email fix)
    if (sessionId) {
      setLoading(true);
      fetch(`/api/session-status?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setSessionData(data);

          // Store customer email if available
          if (data.customer_email) {
            setCustomerEmail(data.customer_email);
          }

          // Track purchase with session data
          if (data.payment_status === "paid") {
            trackEvent("Purchase", {
              value: data.amount_total ? data.amount_total / 100 : 27.0,
              currency: data.currency?.toUpperCase() || "USD",
              content_name: "ADHD Identity Method",
              content_type: "product",
              session_id: sessionId,
              customer_email: data.customer_email,
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching session:", error);
        })
        .finally(() => {
          setLoading(false);
          // Clear URL parameters for cleaner URL
          window.history.replaceState({}, "", "/success");
        });
    }
    // Handle PaymentIntent redirect (LEGACY - still supported)
    else if (redirectStatus === "succeeded" && paymentIntent) {
      trackEvent("Purchase", {
        value: 27.0,
        currency: "USD",
        content_name: "ADHD Identity Method",
        content_type: "product",
        payment_intent: paymentIntent,
      });
      // Clear URL parameters for cleaner URL
      window.history.replaceState({}, "", "/success");
    }
  }, [sessionId, redirectStatus, paymentIntent]);

  // Show loading state while fetching session data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-adhd-yellow mx-auto mb-4" />
          <p className="text-gray-400">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  // Check for failed payment (works for both session and payment intent)
  if (
    (redirectStatus && redirectStatus !== "succeeded") ||
    (sessionData && sessionData.payment_status !== "paid")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
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
        </motion.div>
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

          {/* Show amount and product if we have session data */}
          {sessionData && sessionData.amount_total && (
            <p className="text-lg text-gray-400 mb-8">
              <span className="text-adhd-yellow font-semibold">
                ADHD Identity Method
              </span>
              {" • "}
              <span className="text-adhd-green font-semibold">
                ${(sessionData.amount_total / 100).toFixed(2)}{" "}
                {sessionData.currency?.toUpperCase()}
              </span>
            </p>
          )}
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

          <p className="text-lg text-gray-300 mb-4">
            We've sent everything you need to get started to:
          </p>

          {customerEmail ? (
            <div className="bg-black/50 rounded-lg px-4 py-3 mb-6">
              <p className="text-xl font-mono font-semibold text-white">
                {customerEmail}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-6">
              (The email you used for payment)
            </p>
          )}

          {sessionData?.customer_name && (
            <p className="text-gray-400 mb-4">
              Thank you for your purchase,{" "}
              <span className="text-adhd-yellow">
                {sessionData.customer_name}
              </span>
              !
            </p>
          )}

          <div className="bg-adhd-green/10 border border-adhd-green/30 rounded-lg p-3">
            <p className="text-sm text-adhd-green">
              ✓ Access details sent to your email
            </p>
          </div>
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
            {/* Highlight the user's email provider if we can detect it */}
            {[
              {
                name: "Gmail",
                url: "https://mail.google.com",
                domains: ["gmail.com", "googlemail.com"],
              },
              {
                name: "Outlook",
                url: "https://outlook.com",
                domains: ["outlook.com", "hotmail.com", "live.com"],
              },
              {
                name: "Yahoo",
                url: "https://mail.yahoo.com",
                domains: ["yahoo.com", "ymail.com"],
              },
              {
                name: "iCloud",
                url: "https://mail.icloud.com",
                domains: ["icloud.com", "me.com", "mac.com"],
              },
            ].map((provider) => {
              const isUserProvider =
                customerEmail &&
                provider.domains.some((domain) =>
                  customerEmail.toLowerCase().includes(domain)
                );

              return (
                <motion.a
                  key={provider.name}
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-lg transition flex items-center gap-2 ${
                    isUserProvider
                      ? "bg-adhd-yellow/20 border border-adhd-yellow/50 text-adhd-yellow"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <Inbox className="w-5 h-5" />
                  {provider.name}
                  {isUserProvider && " →"}
                </motion.a>
              );
            })}
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

          {(sessionId || paymentIntent) && (
            <p className="text-xs text-gray-500">
              Order reference:{" "}
              {(sessionId || paymentIntent || "").substring(0, 20)}...
            </p>
          )}

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
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adhd-yellow"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
