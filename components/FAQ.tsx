"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "What if I quit halfway through like always?",
    answer:
      "That's exactly why I designed this differently. The videos are short (max 15 min each), the AI conversation is engaging (like talking to a friend), and you get your report instantly. No waiting, no overwhelm, just quick wins that build momentum.",
  },
  {
    question: "Why does this work when nothing else has?",
    answer:
      "Because we start with WHO you are, not WHAT to do. Every other system tries to force you into their box. We build YOUR box, designed for YOUR brain, YOUR energy patterns, YOUR strengths.",
  },
  {
    question: "Do I need an official ADHD diagnosis?",
    answer:
      "No. If you recognize yourself in the struggles I described, this is for you. Many successful entrepreneurs have ADHD traits without official diagnosis. This system works for anyone who thinks differently.",
  },
  {
    question: "What exactly do I get for $27?",
    answer:
      "3 video modules (45 min total), AI voice analysis session, your personal transformation report, 90-day action plan, and a bonus 1-on-1 call with me. Everything is instantly accessible after purchase.",
  },
  {
    question: "Is my privacy protected with the AI?",
    answer:
      "100%. The AI conversation is completely private and encrypted. Your data is never shared, sold, or used for anything except generating your personal report. You can delete everything with one click.",
  },
  {
    question: "What if it doesn't work for me?",
    answer:
      "30-day money-back guarantee, no questions asked. If you don't get value, you don't pay. But honestly? If you complete the 60-minute process, you'll have insights worth 100x the price.",
  },
];

export default function FAQ() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section ref={ref} className="py-20 relative">
      {/* Background effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-adhd-green/5 rounded-full blur-3xl" />
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
              Real questions from ADHD entrepreneurs
            </span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-black">
            Questions? <span className="gradient-text">I Get It.</span>
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
                className="w-full glass-effect rounded-xl overflow-hidden text-left hover:border-adhd-yellow/30 transition-all duration-300 group"
              >
                <div className="p-6 flex justify-between items-center">
                  <div className="flex items-start gap-3 flex-1">
                    <HelpCircle className="w-5 h-5 text-adhd-yellow mt-0.5 shrink-0" />
                    <span className="font-semibold text-lg group-hover:text-adhd-yellow transition-colors">
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform text-adhd-yellow/50 group-hover:text-adhd-yellow ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 text-gray-300"
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
