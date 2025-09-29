import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import StripePaymentForm from "./StripePaymentForm";
import { useState, useEffect } from "react";

const valueItems = [
  {
    title: "ADHD Identity Reset™ Video Training (3 modules)",
    description:
      "Discover who you are, where you stand, and where you want to go",
    value: "$97",
  },
  {
    title: "AI Voice Analysis Session (15 personal prompts)",
    description: "The AI asks follow-ups until it truly understands you",
    value: "$147",
  },
  {
    title: "Your Personal Transformation Report",
    description: "Your unique roadmap based on your answers",
    value: "$197",
  },
  {
    title: "90-Day ADHD Success Blueprint",
    description: "Step-by-step what to do (and especially: what not to do)",
    value: "$97",
  },
  {
    title: "BONUS: Free 1-on-1 Coaching Call with Jim",
    description: "30 minutes personal guidance (limited spots)",
    value: "$497",
    bonus: true,
  },
];

export default function ValueStack() {
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
    }, 30 * 60 * 1000); // Update every 30 minutes

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl lg:text-5xl font-black text-center mb-16"
        >
          Everything You Get Today For{" "}
          <span className="gradient-text">$27</span>
        </motion.h2>

        <div className="max-w-3xl mx-auto space-y-6">
          {valueItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass-effect p-6 rounded-xl flex justify-between items-center border ${
                item.bonus
                  ? "border-adhd-yellow/20 glow-yellow"
                  : "border-white/10"
              }`}
            >
              <div>
                <h4
                  className={`text-xl font-bold mb-2 ${
                    item.bonus ? "text-adhd-yellow" : ""
                  }`}
                >
                  {item.title}
                </h4>
                <p className="text-gray-400">{item.description}</p>
              </div>
              <div
                className={`text-2xl font-bold ${
                  item.bonus ? "text-adhd-yellow" : "text-gray-500"
                }`}
              >
                {item.value}
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="text-gray-500 text-2xl mb-2">
              Total value: <span className="line-through">$1,035</span>
            </div>
            <div className="text-6xl font-black gradient-text mb-2">$27</div>
            <div className="text-adhd-yellow font-semibold">
              Today 97% off • Only {spotsLeft} spots left
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-lg mx-auto mt-12"
        >
          <StripePaymentForm />
        </motion.div>
      </div>
    </section>
  );
}
