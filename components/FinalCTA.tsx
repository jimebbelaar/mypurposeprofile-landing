import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import StripePaymentForm from "./StripePaymentForm";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function FinalCTA() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [spotsLeft, setSpotsLeft] = useState(7);

  useEffect(() => {
    const calculateSpotsLeft = () => {
      const now = new Date();
      const amsterdamTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" })
      );
      const midnight = new Date(amsterdamTime);
      midnight.setHours(24, 0, 0, 0);
      const difference = midnight.getTime() - amsterdamTime.getTime();
      const hoursUntilMidnight = difference / (1000 * 60 * 60);
      const hoursPassed = 24 - hoursUntilMidnight;
      const spots = Math.max(3, Math.round(7 - (hoursPassed / 24) * 4));
      return spots;
    };

    setSpotsLeft(calculateSpotsLeft());
    const timer = setInterval(() => {
      setSpotsLeft(calculateSpotsLeft());
    }, 30 * 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="py-20 relative">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-adhd-red/5 via-adhd-yellow/5 to-adhd-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl lg:text-5xl font-black mb-8"
          >
            You Have <span className="gradient-text">2 Choices.</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-effect p-8 rounded-2xl border-2 border-adhd-red/20 relative"
            >
              <div className="absolute top-4 right-4">
                <ArrowLeft className="w-6 h-6 text-adhd-red/50" />
              </div>
              <div className="indicator-red px-3 py-1 rounded-full inline-flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-semibold">Option 1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-adhd-red">
                Keep Struggling
              </h3>
              <p className="text-gray-300">
                Keep fighting your ADHD. Start more projects you won't finish.
                Buy more courses you won't watch. Feel guilty. Stay stuck.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-effect p-8 rounded-2xl border-2 border-adhd-green/20 glow-green relative"
            >
              <div className="absolute top-4 right-4">
                <ArrowRight className="w-6 h-6 text-adhd-green" />
              </div>
              <div className="indicator-green px-3 py-1 rounded-full inline-flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Option 2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-adhd-green">
                Break The Pattern
              </h3>
              <p className="text-gray-300">
                Invest $27 (less than an Uber Eats order). Discover who you are
                in 60 minutes. Get a system that works. Finally build that
                business.
              </p>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl mb-12 text-gray-300"
          >
            In 90 days, you'll be 90 days older anyway.
            <br />
            The question is:{" "}
            <span className="text-adhd-yellow font-bold">
              with or without that $10K/month business?
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-lg mx-auto"
          >
            <StripePaymentForm />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6"
          >
            <div className="inline-flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-adhd-red rounded-full animate-pulse" />
                Only {spotsLeft} spots available today
              </span>
              <span>•</span>
              <span>30-day guarantee</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
