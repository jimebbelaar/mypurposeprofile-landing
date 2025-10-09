"use client";

import Image from "next/image";
import StripePaymentForm from "./StripePaymentForm";
import { Zap, Check, Users, Star, Target, Timer } from "lucide-react";

function CheckItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-mpp-green/15 ring-1 ring-mpp-green/30 shadow-sm">
        <Check className="h-3.5 w-3.5 text-mpp-green" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm sm:text-base text-gray-700">{description}</p>
      </div>
    </li>
  );
}

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-24 pb-10 relative overflow-hidden">
      {/* Background (static, no animation) */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-mpp-yellow/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-mpp-orange/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mpp-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 order-1 lg:order-1">
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="indicator-yellow px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  For Corporate Professionals
                </span>
              </div>

              <h1 className="text-4xl sm:text-4xl lg:text-6xl mb-4">
                Stop overthinking and{" "}
                <span className="gradient-text">
                  finally start your business
                </span>{" "}
                — without risking your job
              </h1>

              {/* Badges */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4">
                <div className="flex items-center gap-2 rounded-full px-3 py-2 bg-dark-surface/60 ring-1 ring-white/10 backdrop-blur-sm">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mpp-yellow/20 ring-1 ring-mpp-yellow/40">
                    <Users className="h-3.5 w-3.5 text-mpp-yellow" />
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold">
                    76/100 claimed
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full px-3 py-2 bg-dark-surface/60 ring-1 ring-white/10 backdrop-blur-sm">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mpp-yellow/20 ring-1 ring-mpp-yellow/40">
                    <Star className="h-3.5 w-3.5 text-mpp-yellow" />
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold">
                    4.9/5 satisfaction
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full px-3 py-2 bg-dark-surface/60 ring-1 ring-white/10 backdrop-blur-sm">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mpp-yellow/20 ring-1 ring-mpp-yellow/40">
                    <Target className="h-3.5 w-3.5 text-mpp-yellow" />
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold">
                    94% gained clarity
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-full px-3 py-2 bg-dark-surface/60 ring-1 ring-white/10 backdrop-blur-sm">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mpp-yellow/20 ring-1 ring-mpp-yellow/40">
                    <Timer className="h-3.5 w-3.5 text-mpp-yellow" />
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold">
                    Start in 2 minutes
                  </span>
                </div>
              </div>

              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                <span className="font-bold text-gray-900">
                  This science-based AI assessment analyzes your unique
                  psychology and tells you if entrepreneurship is YOUR path —
                  plus a personalized 90-day roadmap to start safely (or what to
                  do instead).
                </span>
              </p>

              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mt-6">
                <span className="font-bold text-gray-900">
                  Get instant clarity on:
                </span>
              </p>

              {/* Check list */}
              <ul className="space-y-4 text-gray-700 mt-4">
                <CheckItem
                  title="Am I really meant to be an entrepreneur?"
                  description="Yes, No or Hybrid - based on your personality, values, and work style."
                />
                <CheckItem
                  title="What should I actually do?"
                  description="Discover 3–5 specific paths that match your strengths and motivations."
                />
                <CheckItem
                  title="Why do I keep getting stuck?"
                  description="Finally understand and overcome the mental blocks that have kept you trapped."
                />
                <CheckItem
                  title="How do I start without losing everything?"
                  description="Get specific, low-risk steps to test your path while keeping your salary."
                />
              </ul>
            </div>

            {/* Desktop payment form */}
            <div className="hidden lg:block">
              <div id="payment-section">
                <StripePaymentForm />
              </div>
            </div>
          </div>

          {/* Right Content — Image */}
          <div className="relative order-2 lg:order-2 w-full">
            <div className="glass-effect rounded-2xl p-2 glow-yellow">
              <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[1080/1350] rounded-xl overflow-hidden bg-dark-surface/60">
                <Image
                  src="/images/MPP-hero.jpg"
                  alt="My Purpose Profile — hero"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Mobile payment form */}
          <div className="lg:hidden order-3 w-full">
            <div id="payment-section">
              <StripePaymentForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
