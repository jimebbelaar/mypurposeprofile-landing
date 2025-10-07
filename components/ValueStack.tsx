// components/ValueStack.tsx
"use client";

import StripePaymentForm from "./StripePaymentForm";
import { useState, useEffect } from "react";
import {
  Gift,
  Star,
  Zap,
  Brain,
  FileText,
  Phone,
  BadgeDollarSign,
} from "lucide-react";

const valueItems = [
  {
    icon: Brain,
    title: "AI Voice Analysis Session (25 personal prompts)",
    description: "The AI asks follow-ups until it truly understands you",
    value: "$147",
  },
  {
    icon: FileText,
    title: "Your Purpose Profile Report",
    description: "Your unique 15-20 page roadmap based on your answers",
    value: "$197",
  },
  {
    icon: BadgeDollarSign,
    title: "100% Money-Back Guarantee",
    description: "If you don't know what to do next, you don't pay.",
    value: "$27",
  },
  {
    icon: Phone,
    title: "BONUS: Free 1-on-1 Strategy Session",
    description:
      "60 minutes personal guidance from one of our experts (limited spots)",
    value: "$197",
    bonus: true,
  },
];

export default function ValueStack() {
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
    }, 30 * 60 * 1000); // every 30 minutes

    return () => clearInterval(timer);
  }, []);

  const totalValue = valueItems.reduce((sum, item) => {
    return sum + parseInt(item.value.replace("$", ""));
  }, 0);

  return (
    <section className="py-12 sm:py-16 lg:py-20 relative">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-mpp-yellow/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="indicator-green px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Total value: ${totalValue}
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl">
            Everything You Get Today For{" "}
            <span className="gradient-text">$47</span>
          </h2>
          {/* Optional: show spotsLeft if you want */}
          {/* <p className="mt-2 text-sm text-gray-600">Founding spots left today: {spotsLeft}</p> */}
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {valueItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`glass-effect p-6 rounded-xl flex items-center gap-6 transition-all ${
                  item.bonus
                    ? "border-2 border-mpp-yellow/30 glow-yellow relative overflow-hidden"
                    : "border border-glass-border"
                }`}
              >
                <div
                  className={`p-3 rounded-lg ${
                    item.bonus ? "bg-mpp-yellow/10" : "bg-dark-surface"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      item.bonus ? "text-mpp-yellow" : "text-mpp-green"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <h4
                    className={`text-xl font-bold mb-1 ${
                      item.bonus ? "text-mpp-yellow" : ""
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-gray-700 text-sm">{item.description}</p>
                </div>

                <div
                  className={`text-2xl font-bold ${
                    item.bonus
                      ? "text-mpp-yellow"
                      : "text-gray-500 line-through"
                  }`}
                >
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-lg mx-auto mt-12">
          <StripePaymentForm />
        </div>
      </div>
    </section>
  );
}
