"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import StripePaymentForm from "./StripePaymentForm";
import { X, Zap, Check } from "lucide-react";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-24 pb-10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-mpp-yellow/10 rounded-full blur-3xl float" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-mpp-orange/10 rounded-full blur-3xl float"
          style={{ animationDelay: "3s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mpp-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 order-1 lg:order-1">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <span className="indicator-yellow px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  For Corporate Professionals Ready to Escape
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-6xl mb-4"
              >
                Stop Overthinking and Finally Start
                <span className="gradient-text"> Your Business </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-700 mb-4 leading-relaxed"
              >
                <span className="font-extrabold text-gray-900">
                  Your AI-powered Purpose Profile reveals exactly:
                </span>
              </motion.p>

              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-1 flex-shrink-0 text-current" />
                  <div>
                    <p className="font-semibold">
                      Am I cut out for entrepreneurship?
                    </p>
                    <p className="text-sm sm:text-base">
                      Get a clear YES or NO based on your personality, values,
                      and work style.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-1 flex-shrink-0 text-current" />
                  <div>
                    <p className="font-semibold">What should I actually do?</p>
                    <p className="text-sm sm:text-base">
                      Discover 3–5 specific paths that match your strengths and
                      motivations.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-1 flex-shrink-0 text-current" />
                  <div>
                    <p className="font-semibold">
                      Why can't I just START already?
                    </p>
                    <p className="text-sm sm:text-base">
                      Finally understand and overcome the mental blocks that
                      have kept you trapped.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 mt-1 flex-shrink-0 text-current" />
                  <div>
                    <p className="font-semibold">
                      How do I leave without losing everything?
                    </p>
                    <p className="text-sm sm:text-base">
                      Get specific, low-risk steps to test your path while
                      keeping your salary.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            ></motion.div>

            {/* Desktop payment form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="hidden lg:block"
            >
              <div id="payment-section">
                <StripePaymentForm />
              </div>
            </motion.div>
          </div>

          {/* Right Content — Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative order-2 lg:order-2 w-full"
          >
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
          </motion.div>

          {/* Mobile payment form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:hidden order-3 w-full"
          >
            <div id="payment-section">
              <StripePaymentForm />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
