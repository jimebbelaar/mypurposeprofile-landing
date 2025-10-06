// ================
// components/Solution.tsx
// ================
"use client";  // Add this if you're using app router
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
// Add this import at the top of your existing Solution.tsx file:
import Image from 'next/image'

const steps = [
  {
    number: "1",
    title: "Watch 3 Short Videos",
    description:
      "No boring theory. Immediately applicable insights about identity, where you are now, and where you want to go.",
    duration: "30 min",
  },
  {
    number: "2",
    title: "Talk With The AI",
    description:
      "15 voice prompts. The AI listens, asks questions, and sees patterns you can't see yourself.",
    duration: "20 min",
  },
  {
    number: "3",
    title: "Get Your Personal Report",
    description:
      "No generic advice. An action plan based on YOUR answers, YOUR situation, YOUR brain.",
    duration: "Instant",
  },
];

const whatYouGet = [
  {
    icon: "🔍",
    title: "Your Hidden Pattern Revealed",
    description:
      "Why you self-sabotage, what your resistance protects, and how to break through",
  },
  {
    icon: "👤",
    title: "Who You Really Are (Without Masks)",
    description:
      "Your authentic strengths, what makes you unique, and how to use this for success",
  },
  {
    icon: "🗓️",
    title: "Your 90-Day Action Plan",
    description:
      "Exactly what to do (and especially: what NOT to do) to go from $0 to $10K/month",
  },
  {
    icon: "🚀",
    title: "Your Personal Success Formula",
    description:
      "How you work best, when you have energy, and how to maintain momentum",
  },
];

export default function Solution() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

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
              The breakthrough that changes everything
            </p>
            <h2 className="text-3xl lg:text-5xl font-black mb-4">
              Stop Fighting Your ADHD.
              <br />
              Use It As Your <span className="gradient-text">Superpower.</span>
            </h2>
            <p className="text-xl text-gray-400">
              In 60 minutes, discover who you really are underneath all the
              masks - and get a personal action plan that fits how your brain
              works.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                <p className="text-gray-400">{step.description}</p>
                <div className="text-adhd-yellow font-semibold mt-4">
                  {step.duration}
                </div>
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
            className="text-3xl lg:text-5xl font-black text-center mb-16"
          >
            This Is What You Get In Your{" "}
            <span className="gradient-text">
              Personal Transformation Report
            </span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {whatYouGet.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-effect p-8 rounded-2xl border border-adhd-yellow/20"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-black mb-4 text-adhd-yellow">
                  {item.title}
                </h3>
                <p className="text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
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
                ❌ What You've Tried So Far
              </h3>
              <div className="space-y-4">
                {[
                  "Pomodoro timers (works 3 days)",
                  "Time blocking (too rigid for ADHD)",
                  "Accountability buddy (shame when you fail)",
                  "Just work harder (burnout)",
                  "Medication (zombie mode)",
                  "Just have discipline (LOL)",
                  "The 847th productivity app",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 text-gray-400"
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
                ✅ MyPurposeProfile™
              </h3>
              <div className="space-y-4">
                {[
                  "Start with WHO you are, not WHAT to do",
                  "Work WITH your ADHD brain, not against it",
                  "Use hyperfocus as superpower",
                  "Flexible systems that adapt",
                  "Energy management over time management",
                  "Dopamine-driven planning",
                  "Authentic success without masks",
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

      {/* Founder Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto glass-effect rounded-3xl p-12 border border-adhd-yellow/30"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-black mb-6">
                  From burnout to 7-figure digital agency
                </h3>
                <p className="text-gray-300 mb-4">
                  Hey, I'm Jim. At 24 I got my ADHD diagnosis. Finally
                  understood why I'd started 37 projects and finished 0.
                </p>
                <p className="text-gray-300 mb-4">
                  I tried everything. Ritalin made me a productive zombie. Time
                  blocking worked for 4 days. Discipline? I had more shame than
                  discipline.
                </p>
                <p className="text-gray-300 mb-4">
                  Then I stopped fighting. Instead of 'managing' my ADHD, I
                  started working with it. I built systems that fit my brain.
                  Result? I now run a 7-figure digital agency.
                </p>
                <p className="text-adhd-yellow font-semibold">
                  This is what I'm giving you today: The exact method that took
                  me from chronic starter to 7-figure entrepreneur. No BS, no
                  discipline lectures. Just a system that works for ADHD brains.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-adhd-yellow/30">
                  <Image
                    src="/images/jim.jpg"
                    alt="Jim - Founder of ADHD Harmony"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
