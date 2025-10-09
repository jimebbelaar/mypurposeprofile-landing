"use client";

import StripePaymentForm from "./StripePaymentForm";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-mpp-red/5 via-mpp-yellow/5 to-mpp-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-black mb-12">
            You Have Two Paths.{" "}
            <span className="gradient-text">One Choice.</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="glass-effect p-8 rounded-2xl border-2 border-mpp-red/20 relative">
              <div className="absolute top-4 right-4">
                <ArrowLeft className="w-6 h-6 text-mpp-red/50" />
              </div>
              <div className="indicator-red px-3 py-1 rounded-full inline-flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-semibold">Option 1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-mpp-red">
                Stay Comfortable
              </h3>
              <p className="text-gray-700">
                Keep scrolling LinkedIn. Tell yourself "next year." Watch others
                live your dream. Stay safe. Stay stuck.
              </p>
            </div>

            <div className="glass-effect p-8 rounded-2xl border-2 border-mpp-green/20 glow-green relative">
              <div className="absolute top-4 right-4">
                <ArrowRight className="w-6 h-6 text-mpp-green" />
              </div>
              <div className="indicator-green px-3 py-1 rounded-full inline-flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Option 2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-mpp-green">
                Take the Leap
              </h3>
              <p className="text-gray-700">
                Invest $47 (less than a night out). Discover who you are beneath
                the title. Finally build that business.
              </p>
            </div>
          </div>

          <p className="text-2xl mb-12 text-gray-700 font-medium">
            In 90 days, you'll be 90 days older anyway.
            <br />
            The question is:{" "}
            <span className="text-mpp-yellow font-bold">
              with or without your first client?
            </span>
          </p>

          <div className="max-w-lg mx-auto">
            <StripePaymentForm />
          </div>
        </div>
      </div>
    </section>
  );
}
