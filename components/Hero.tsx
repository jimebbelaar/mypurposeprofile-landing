// components/Hero.tsx
"use client";

import { motion } from "framer-motion";
import StripePaymentForm from "./StripePaymentForm";
import { CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-14 pb-10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-adhd-yellow/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-adhd-orange/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content - Shows second on mobile, first on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 order-2 lg:order-1"
          >
            <div>
              <p className="text-adhd-yellow font-semibold mb-4 text-lg">
                For (aspiring) ADHD Entrepreneurs
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-6">
                Stop Self-Sabotaging And Finally Build That{" "}
                <span className="gradient-text">$10K/Month</span> Business
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                Discover in 3 minutes why you always quit halfway - and get a
                personal roadmap that actually works for your ADHD brain
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-adhd-green" />
                <span>No discipline BS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-adhd-green" />
                <span>ADHD-proof system</span>
              </div>
            </div>

            {/* Desktop only: Payment form */}
            <div className="hidden lg:block">
              <StripePaymentForm />
            </div>
          </motion.div>

          {/* Right Content - Loom Video - Shows first on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 lg:order-2 w-full"
          >
            <div className="glass-effect rounded-2xl p-2 glow-yellow">
              <div className="relative aspect-[1080/1350] bg-gray-900 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.loom.com/embed/4c89601b6fc8411d89982db83df48bdc?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true"
                  frameBorder="0"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Mobile only: Payment form shows after video and content */}
          <div className="lg:hidden order-3 w-full">
            <StripePaymentForm />
          </div>
          
        </div>
      </div>
    </section>
  );
}