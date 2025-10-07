"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "What if I realize I should stay in corporate?",
    answer:
      "That's valuable clarity too. About 20% discover they just need a different role or company, not entrepreneurship. Either way, you'll know.",
  },
  {
    question: "How is this different from career coaching?",
    answer:
      "Career coaches cost $200-500/hour and take weeks to get clarity. This uses AI to analyze patterns in 60 minutes for $47. Plus, no required vulnerability with a stranger.",
  },
  {
    question: "Do I need a business idea first?",
    answer:
      "No. This is about discovering who you are first. The right ideas naturally follow clarity about your purpose and values.",
  },
  {
    question: "What if I'm too risk-averse for entrepreneurship?",
    answer:
      "The assessment reveals whether you're suited for entrepreneurship, employment, or a hybrid approach. Not everyone should quit. That's okay.",
  },
  {
    question: "Is my information private?",
    answer:
      "100% confidential. Your responses are analyzed by AI, not humans. We never share or sell your data.",
  },
  {
    question: "What if it doesn't give me clarity?",
    answer:
      "30-day money-back guarantee. If you don't get valuable insights, email us for a full refund. No questions asked.",
  },
];

export default function FAQ() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section ref={ref} className="py-12 sm:py-16 lg:py-20 relative">
      {/* Background effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-mpp-green/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="indicator-yellow px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Questions From Corporate Professionals
            </span>
          </div>
          <h2 className="text-3xl lg:text-5xl">
            Questions? <span className="gradient-text">We Get It.</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full glass-effect rounded-xl overflow-hidden text-left hover:border-mpp-yellow/30 transition-all duration-300 group"
              >
                <div className="p-6 flex justify-between items-center">
                  <div className="flex items-start gap-3 flex-1">
                    <HelpCircle className="w-5 h-5 text-mpp-yellow mt-0.5 shrink-0" />
                    <span className="font-semibold text-lg group-hover:text-mpp-yellow transition-colors">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform text-mpp-yellow/50 group-hover:text-mpp-yellow ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 text-gray-700"
                  >
                    <div className="pl-8">{faq.answer}</div>
                  </motion.div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
