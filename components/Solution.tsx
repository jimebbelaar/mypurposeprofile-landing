// ================
// components/Solution.tsx
// ================
"use client";  // Add this if you're using app router
import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
// Add this import at the top of your existing Solution.tsx file:
import Image from 'next/image'

const steps = [
  {
    number: "1",
    title: "25 Questions",
    description:
      "No vague personality or careertest. Each question is designed to bypass your defenses and surface your real drivers.",
  },
  {
    number: "2",
    title: "Deep AI Analysis",
    description:
      "25 voice prompts. The AI listens, asks follow-up questions, and sees patterns you can't see yourself.",
  },
  {
    number: "3",
    title: "Personal Report",
    description:
      "No labels or generic advice. An 360° breakdown of who you are, how you work best, and what business to build.",
   
  },
  {
    number: "4",
  title: "Strategy Session (Optional)",
  description:
    "A free 1-hour session with one of our experts to discuss your report and get personalized advice.",
  },  
];

const whatYouGet = [
  {
    icon: "🧭",
    title: "Your Core Direction",
    description:
      "Find out what you’re truly built for — and whether entrepreneurship is the path that fits your wiring, values, and motivation.",
  },
  {
    icon: "💡",
    title: "Your Monetizable Strengths",
    description:
      "See what you’re naturally good at, what others would pay for, and how to turn your skills into real offers that create impact (and income).",
  },
  {
    icon: "⚙️",
    title: "Your Optimal Work Style",
    description:
      "Learn how you work best — how you make decisions, stay energized, and which business models match your natural rhythm.",
  },
  {
    icon: "🚀",
    title: "Your Entrepreneurial Fit",
    description:
      "Discover the type of business or career path that aligns with your personality — from solo creator to strategic founder — and what to avoid.",
  },
  {
    icon: "🧩",
    title: "Your Growth Edge",
    description:
      "Identify the skills, mindset shifts, and experiences you still need to grow into your next chapter with confidence.",
  },
  {
    icon: "💭",
    title: "Your Hidden Blockers",
    description:
      "Finally see what’s been holding you back — the fears, patterns, and beliefs that kept you stuck — and how to move past them for good.",
  },
  {
    icon: "🗺️",
    title: "Your 90-Day Exit Roadmap",
    description:
      "Get a clear, low-risk plan to start testing your next move while still in the safety of your paycheck — no blind leaps required.",
  },
  {
    icon: "✨",
    title: "Your Personal Blueprint",
    description:
      "A complete picture of who you are and what success looks like when everything aligns — purpose, profit, and peace of mind.",
  },
];

export default function Solution() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  // Local carousel component used for the 8-item "What You Get" slider
  const Carousel = ({
    items,
    itemsPerSlide = 4,
  }: {
    items: typeof whatYouGet;
    itemsPerSlide?: number;
  }) => {
    const [active, setActive] = useState(0);
    const slides = Math.ceil(items.length / itemsPerSlide);
    const start = active * itemsPerSlide;
    const visible = items.slice(start, start + itemsPerSlide);

    return (
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {visible.map((item, index) => (
            <motion.div
              key={`${active}-${index}-${item.title}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="glass-effect p-8 rounded-2xl border border-mpp-yellow/20"
            >
              <div className="text-3xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-black mb-3 text-mpp-yellow">{item.title}</h3>
              <p className="text-gray-700">{item.description}</p>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-3 mt-8">
          {Array.from({ length: slides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-2.5 w-8 rounded-full transition-all ${
                i === active ? "bg-mpp-yellow" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Process Section */}
      <section ref={ref} className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-adhd-yellow font-semibold mb-4">
            Why You Can’t Think Your Way Into Freedom
            </p>
            <h2 className="text-3xl lg:text-5xl font-black mb-4">
            You're Using Corporate Strategy for a Personal Calli
              <br />
              
            </h2>
            <p className="text-xl text-gray-600">
            You’ve been trained to analyze, plan, perform, and optimize — but not to trust your inner compass.
            In 60 minutes, you'll discover who you really are underneath all the
            corporate masks and conditioning and what you're meant to do.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-adhd-yellow to-adhd-orange rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-black">
                  {step.number}
                </div>
                <h3 className="text-2xl font-black mb-2">{step.title}</h3>
                <p className="text-gray-700">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl lg:text-5xl font-black text-center mb-10"
          >
            This Is What You Get In Your {" "}
            <span className="gradient-text">Purpose Profile</span>
          </motion.h2>

          {/* Simple 2-slide carousel: 4 items per slide */}
          <Carousel items={whatYouGet} itemsPerSlide={4} />
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl lg:text-5xl font-black text-center mb-16"
          >
            Why This <span className="gradient-text">Actually Works</span> (When
            Everything Else Fails)
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-black mb-8 text-adhd-red">
                ❌ Why You're Still You Stuck
              </h3>
          
              <p className="text-gray-700 mb-4">You've been trained to play it "safe":</p>
              <div className="space-y-4">
                {[
                  "Analyze every risk until paralyzed",
                  "Get consensus before acting (but from who?)",
                  "Get rewarded for follwing the rules and fit the mold",
                  "Perfect the plan before starting (impossible)", 
                  "Never show vulnerability (so you stay hidden)",
                  "Compare yourself to others through titles and benchmarks",

                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 text-gray-600"
                  >
                    <span className="text-adhd-red">✗</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-black mb-8 text-adhd-green">
                ✅ Why MyPurposeProfile™ Flips the Script
              </h3>
              <div className="space-y-4">
                {[
                  "Rewires corporate caution into entrepreneurial confidence",
                  "Builds self-trust by revealing your natural leadership style",
                  "Shows which business truly fits your psychology and values",
                  "Transforms fear into action with a practical 90-day roadmap",
                  "Breaks through safety patterns disguised as preparation",
                  "Gives you the clarity and conviction to take the next step",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-adhd-green">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      
    </>
  );
}
