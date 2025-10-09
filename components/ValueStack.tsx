"use client";

import StripePaymentForm from "./StripePaymentForm";
import { Gift, Brain, FileText, Phone, BadgeCheck, Clock } from "lucide-react";

const valueItems = [
  {
    icon: Brain,
    title: "AI Voice Analysis Session (25 personal prompts)",
    description:
      "Replaces 20+ hours of journaling, self-reflection, and career research you'd do alone.",
    comparison: "vs. $2,000-3,000 of your time at your hourly rate",
    value: 147,
    displayValue: "$147",
  },
  {
    icon: FileText,
    title: "Your Purpose Profile Report",
    description:
      "The clarity of 6-8 coaching sessions condensed into one comprehensive report.",
    comparison: "vs. $900-1,600 for equivalent coaching sessions",
    value: 197,
    displayValue: "$197",
  },
  {
    icon: BadgeCheck,
    title: "100% Money-Back Guarantee",
    description:
      "If you complete the assessment and don't get a clear next step, we refund you completely. No questions asked. Zero risk.",
    comparison: "Peace of mind: priceless",
    value: 27,
    displayValue: "Included",
    highlight: true,
  },
  {
    icon: Phone,
    title: "BONUS: Free 1-on-1 Strategy Session",
    description:
      "60 minutes of personal guidance from one of our expert founders. They'll help you understand your report and create your action plan.",
    comparison: "vs. $200-400 for private strategy consultations",
    value: 197,
    displayValue: "$197",
    bonus: true,
  },
];

export default function ValueStack() {
  const totalValue = valueItems.reduce((sum, item) => sum + item.value, 0);
  const finalPrice = 27;
  const savings = totalValue - finalPrice;
  const discountPercentage = Math.round(
    ((totalValue - finalPrice) / totalValue) * 100
  );

  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-mpp-yellow/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-mpp-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="bg-mpp-green/10 text-mpp-green px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border border-mpp-green/20">
              <Gift className="w-4 h-4" />
              Limited Time: {discountPercentage}% OFF
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Everything you get today
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            The complete system to go from stuck and overthinking to clear and
            building — for less than dinner out.
          </p>
        </div>

        {/* Value Items */}
        <div className="max-w-4xl mx-auto space-y-3 mb-8">
          {valueItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`glass-effect p-5 sm:p-6 rounded-2xl transition-all hover:scale-[1.01] ${
                  item.bonus
                    ? "border-2 border-mpp-yellow/40 bg-gradient-to-br from-mpp-yellow/5 to-transparent relative overflow-hidden"
                    : item.highlight
                    ? "border-2 border-mpp-green/40 bg-gradient-to-br from-mpp-green/5 to-transparent"
                    : "border border-gray-200/50"
                }`}
              >
                {item.bonus && (
                  <div className="absolute top-0 right-0 bg-mpp-yellow text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    BONUS
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      item.bonus
                        ? "bg-mpp-yellow/20"
                        : item.highlight
                        ? "bg-mpp-green/20"
                        : "bg-mpp-green/10"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        item.bonus
                          ? "text-mpp-yellow"
                          : item.highlight
                          ? "text-mpp-green"
                          : "text-mpp-green"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-700 text-sm sm:text-base mb-2 leading-relaxed">
                      {item.description}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm italic">
                      {item.comparison}
                    </p>
                  </div>

                  <div className="shrink-0 text-right self-start sm:self-center">
                    <div
                      className={`text-xl sm:text-2xl font-bold ${
                        item.bonus || item.highlight
                          ? item.bonus
                            ? "text-mpp-yellow"
                            : "text-mpp-green"
                          : "text-gray-400 line-through"
                      }`}
                    >
                      {item.displayValue}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="glass-effect p-8 rounded-2xl border-2 border-gray-200/50">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-gray-600">
                <span className="text-lg">Total Value:</span>
                <span className="text-2xl font-bold line-through text-gray-400">
                  ${totalValue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">You Save:</span>
                <span className="text-2xl font-bold text-mpp-green">
                  ${savings}
                </span>
              </div>
              <div className="border-t-2 border-dashed border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">Your Price Today:</span>
                  <span className="text-4xl font-bold gradient-text">
                    ${finalPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-lg mx-auto">
          <StripePaymentForm />
        </div>
      </div>
    </section>
  );
}
