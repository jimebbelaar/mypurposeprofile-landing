"use client";

import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import StripePaymentForm from "./StripePaymentForm";
import { CheckCircle, X, Zap, Heart, Clock, Shield } from "lucide-react";

// VTurb Player Component following official React guide
function VTurbPlayer() {
  return (
    <>
      <div
        dangerouslySetInnerHTML={{
          __html:
            '<vturb-smartplayer id="vid-68e349514809825c61fb1c76" style="display: block; margin: 0 auto; min-width: 100%; min-height: 100%;"></vturb-smartplayer>',
        }}
      />
      <Helmet>
        <script type="text/javascript">{`
          var s=document.createElement("script");
          s.src="https://scripts.converteai.net/f3ae95a0-ae37-43cb-a4df-9c965554bcfa/players/68e349514809825c61fb1c76/v4/player.js";
          s.async=!0;
          document.head.appendChild(s);
        `}</script>
      </Helmet>
    </>
  );
}

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-14 pb-10 relative overflow-hidden">
      {/* Background Effects - More subtle with blue tints */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-adhd-yellow/10 rounded-full blur-3xl float" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-adhd-orange/10 rounded-full blur-3xl float"
          style={{ animationDelay: "3s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-adhd-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content - Shows second on mobile, first on desktop */}
          <div className="space-y-8 order-2 lg:order-1">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <span className="indicator-yellow px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  For (aspiring) ADHD Entrepreneurs
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-6xl font-black mb-6"
              >
                Stop Self-Sabotaging And Finally Build That{" "}
                <span className="gradient-text">$10K/Month</span> Business
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed"
              >
                Discover in 4 minutes why you always quit halfway - and get a
                personal roadmap that actually works for your ADHD brain
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex flex-wrap gap-3">
                <div className="indicator-red px-3 py-2 rounded-full flex items-center gap-1">
                  <X className="w-4 h-4" />
                  <span className="font-medium text-xs">No discipline BS</span>
                </div>
                <div className="indicator-green px-3 py-2 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium text-xs">ADHD-proof system</span>
                </div>
              </div>

              {/* Additional trust indicators */}
              {/* <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="w-4 h-4 text-adhd-green" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-adhd-yellow" />
                  <span>Instant access (start in 2 min)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Heart className="w-4 h-4 text-adhd-red" />
                  <span>Made by ADHDer for ADHDers</span>
                </div>
              </div> */}
            </motion.div>

            {/* Desktop only: Payment form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="hidden lg:block"
            >
              <StripePaymentForm />
            </motion.div>
          </div>

          {/* Right Content - Loom Video - Shows first on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative order-1 lg:order-2 w-full"
          >
            <div className="glass-effect rounded-2xl p-2 glow-yellow">
              <div className="relative aspect-[1080/1350] bg-dark-surface rounded-xl overflow-hidden">
                <VTurbPlayer />
              </div>
            </div>
          </motion.div>

          {/* Mobile only: Payment form shows after video and content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:hidden order-3 w-full"
          >
            <StripePaymentForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
