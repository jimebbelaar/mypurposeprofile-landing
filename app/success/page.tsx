"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trackEvent } from "@/lib/meta-pixel";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Mail,
  Inbox,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface SessionData {
  success: boolean;
  customerEmail: string | null;
  customerName: string | null;
  productInfo: {
    productName: string;
    amount: number;
    currency: string;
  };
  paymentStatus: string;
  verified: boolean;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAndRetrieveSession = async () => {
      // Immediate validation - no payment intent means no access
      if (!paymentIntent) {
        setError("Invalid access. No payment reference found.");
        setLoading(false);
        // Redirect after 3 seconds
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      // Check redirect status from Stripe
      if (redirectStatus !== "succeeded") {
        setError("Payment was not completed successfully.");
        setLoading(false);
        setTimeout(() => router.push("/"), 3000);
        return;
      }

      try {
        const response = await fetch("/api/verify-payment-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent,
            expectedStatus: "succeeded",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment verification failed");
        }

        const data: SessionData = await response.json();

        // Additional verification
        if (!data.verified || data.paymentStatus !== "succeeded") {
          throw new Error("Payment could not be verified");
        }

        // Check if we have customer email
        if (!data.customerEmail) {
          // This shouldn't happen with our setup, but if it does, it's an error
          console.error("No customer email found for payment:", paymentIntent);
          throw new Error(
            "Customer information incomplete. Please contact support."
          );
        }

        setSessionData(data);

        // Track successful purchase with actual amount
        const amount = data.productInfo.amount / 100; // Convert from cents
        trackEvent("Purchase", {
          value: amount,
          currency: data.productInfo.currency.toUpperCase(),
          content_name: data.productInfo.productName,
          content_type: "product",
          payment_intent: paymentIntent,
          customer_email: data.customerEmail,
        });

        // Clear URL parameters for security (prevent sharing/bookmarking)
        window.history.replaceState({}, "", "/success");
      } catch (err: any) {
        console.error("Error verifying payment:", err);
        setError(
          err.message || "Failed to verify payment. Please contact support."
        );

        // Don't auto-redirect if it's a support issue
        if (!err.message?.includes("contact support")) {
          setTimeout(() => router.push("/"), 5000);
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAndRetrieveSession();
  }, [paymentIntent, redirectStatus, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-adhd-yellow mx-auto mb-4" />
          <p className="text-gray-400">Verifying your payment...</p>
          <p className="text-sm text-gray-500 mt-2">
            Please do not close this window
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-adhd-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-adhd-red" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-8">
            {error || "Unable to verify your payment."}
          </p>

          {error?.includes("contact support") ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Reference: {paymentIntent || "N/A"}
              </p>
              <a
                href="mailto:info@adhdharmony.com"
                className="inline-block bg-gradient-to-r from-adhd-yellow to-adhd-orange text-black font-bold px-8 py-4 rounded-xl hover:scale-105 transition-all"
              >
                Contact Support
              </a>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Redirecting to homepage...</p>
          )}
        </motion.div>
      </div>
    );
  }

  const displayAmount = sessionData.productInfo.amount / 100;
  const displayEmail = sessionData.customerEmail;

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
          <div className="w-24 h-24 bg-adhd-green rounded-full flex items-center justify-center mx-auto relative">
            <CheckCircle className="w-16 h-16 text-white" />
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-adhd-yellow rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-5xl font-black mb-4">
            <span className="gradient-text">Payment Verified!</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-2">
            Your purchase was completed successfully 🎉
          </p>
          <p className="text-lg text-gray-400 mb-8">
            <span className="text-adhd-yellow font-semibold">
              {sessionData.productInfo.productName}
            </span>
            {" • "}
            <span className="text-adhd-green font-semibold">
              ${displayAmount.toFixed(2)}{" "}
              {sessionData.productInfo.currency.toUpperCase()}
            </span>
          </p>
        </motion.div>

        {/* Email Confirmation Card */}
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
            We've sent your access details to:
          </p>

          <div className="bg-black/50 rounded-lg px-4 py-3 mb-6">
            <p className="text-xl font-mono font-semibold text-white">
              {displayEmail}
            </p>
          </div>

          {sessionData.customerName && (
            <p className="text-gray-400 mb-4">
              Thank you for your purchase,{" "}
              <span className="text-adhd-yellow">
                {sessionData.customerName}
              </span>
              !
            </p>
          )}

          <div className="bg-adhd-green/10 border border-adhd-green/30 rounded-lg p-3 mt-4">
            <p className="text-sm text-adhd-green">
              ✓ Payment verified and secure
            </p>
          </div>
        </motion.div>

        {/* Email Provider Quick Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <p className="text-gray-400 mb-4">Quick access to your inbox:</p>

          <div className="flex justify-center gap-3 flex-wrap">
            {/* Detect email provider and highlight it */}
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
              const isUserProvider = provider.domains.some((domain) =>
                displayEmail?.toLowerCase().includes(domain)
              );

              return (
                <motion.a
                  key={provider.name}
                  href={provider.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-lg transition flex items-center gap-2 ${
                    isUserProvider
                      ? "bg-adhd-yellow/20 border border-adhd-yellow/50 text-adhd-yellow"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  {provider.name}
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 space-y-4"
        >
          <div className="p-4 bg-adhd-yellow/10 rounded-xl border border-adhd-yellow/30">
            <p className="text-sm text-adhd-yellow font-medium mb-2">
              💡 Important: Check Your Spam Folder
            </p>
            <p className="text-xs text-gray-400">
              Emails typically arrive within 2-5 minutes. If you don't see it in
              your inbox, please check your spam or promotions folder.
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Transaction verified • Secure checkout completed</p>
            <p className="font-mono opacity-50">
              ID: {paymentIntent?.substring(0, 20)}...
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Questions? Contact us at{" "}
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
