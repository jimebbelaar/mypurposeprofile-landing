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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-mpp-red/5 via-mpp-yellow/5 to-mpp-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl lg:text-5xl font-black mb-8"
          >
            You Have <span className="gradient-text">Two Paths. One Choices.</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-effect p-8 rounded-2xl border-2 border-mpp-red/20 relative"
            >
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
              Keep scrolling LinkedIn. Tell yourself "next year." Watch others live your dream. Stay safe. Stay stuck.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-effect p-8 rounded-2xl border-2 border-mpp-green/20 glow-green relative"
            >
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
                Invest $47 (less than a night out). Discover who you are beneath the title. Finally build that
                business.
              </p>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-2xl mb-12 text-gray-700"
          >
            In 90 days, you'll be 90 days older anyway.
            <br />
            The question is:{" "}
            <span className="text-mpp-yellow font-bold">
              with or without your first client?
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
