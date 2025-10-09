"use client";

import { useState } from "react";
import { AlertCircle, Sparkle } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "25 Questions",
    description:
      "No vague personality or career test. Each question is designed to bypass your defenses and surface your real drivers.",
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
      "No labels or generic advice. A 360° breakdown of who you are, how you work best, and what business to build.",
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
      "Find out what you're truly built for — and whether entrepreneurship is the path that fits your wiring, values, and motivation.",
  },
  {
    icon: "🚀",
    title: "Your Entrepreneurial Fit",
    description:
      "Discover the type of business or career path that aligns with your personality — from solo creator to strategic founder — and what to avoid.",
  },
  {
    icon: "💡",
    title: "Your Monetizable Strengths",
    description:
      "See what you're naturally good at, what others would pay for, and how to turn your skills into real offers that create impact (and income).",
  },
  {
    icon: "💭",
    title: "Your Hidden Blockers",
    description:
      "Finally see what's been holding you back — the fears, patterns, and beliefs that kept you stuck — and how to move past them for good.",
  },
  {
    icon: "⚙️",
    title: "Your Optimal Work Style",
    description:
      "Learn how you work best — how you make decisions, stay energized, and which business models match your natural rhythm.",
  },
  {
    icon: "🧩",
    title: "Your Growth Edge",
    description:
      "Identify the skills, mindset shifts, and experiences you still need to grow into your next chapter with confidence.",
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
  const [active, setActive] = useState(0);
  const slides = Math.ceil(whatYouGet.length / 4);
  const start = active * 4;
  const visible = whatYouGet.slice(start, start + 4);

  return (
    <>
      {/* Process Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="indicator-red px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Why You're Stuck
              </span>
            </div>
            <h2 className="text-4xl font-bold lg:text-5xl mb-4">
              You're using corporate strategy for a personal calling
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              You've been trained to analyze, plan, perform, and optimize — but
              not to trust your inner compass. In 60 minutes, you'll discover
              who you really are underneath all the corporate masks and
              conditioning and what you're meant to do next.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-mpp-yellow to-mpp-orange rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl font-black text-white shadow-lg border-2 border-mpp-yellow/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-mpp-yellow/30 hover:border-mpp-yellow/40">
                  {step.number}
                </div>
                <h3 className="text-2xl font-black mb-3">{step.title}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-12 sm:py-16 lg:py-20 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl lg:text-5xl text-center mb-10">
            This is what you get in your{" "}
            <span className="gradient-text">Purpose Profile</span>
          </h2>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {visible.map((item, index) => (
                <div
                  key={`${active}-${index}-${item.title}`}
                  className="glass-effect p-8 rounded-2xl border border-mpp-yellow/20"
                >
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <h3 className="text-2xl font-black mb-3 text-mpp-yellow">
                    {item.title}
                  </h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setActive(active > 0 ? active - 1 : slides - 1)}
                className="p-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 hover:border-mpp-yellow/30 transition-all"
                aria-label="Previous slide"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: slides }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      i === active
                        ? "bg-mpp-yellow text-white shadow-lg"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setActive(active < slides - 1 ? active + 1 : 0)}
                className="p-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 hover:border-mpp-yellow/30 transition-all"
                aria-label="Next slide"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mpp-yellow/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-mpp-orange/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-mpp-yellow/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ring-1 ring-green-200">
                <Sparkle className="w-4 h-4 text-green-600" />
                The Real Difference
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight max-w-4xl mx-auto mb-6">
              Why this{" "}
              <span className="bg-gradient-to-r from-mpp-yellow to-mpp-orange bg-clip-text text-transparent">
                actually works
              </span>{" "}
              <br className="hidden sm:block" />
              (When everything else fails)
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Left Side - Problems */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white p-8 lg:p-10 rounded-3xl border-2 border-red-100 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-black text-red-600 mb-2">
                      Why You're Still Stuck
                    </h3>
                    <p className="text-gray-600 font-medium">
                      You've been trained to play it "safe"
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-red-200 via-red-300 to-red-200 mb-6" />

                <div className="space-y-4">
                  {[
                    {
                      text: "Analyze every risk until paralyzed",
                      subtext: "Analysis becomes procrastination",
                    },
                    {
                      text: "Get consensus before acting (but from who?)",
                      subtext: "Waiting for permission that never comes",
                    },
                    {
                      text: "Rewarded to follow the rules and fit the mold",
                      subtext: "Your uniqueness is seen as a problem",
                    },
                    {
                      text: "Perfect the plan before starting (impossible)",
                      subtext: "Perfectionism disguised as preparation",
                    },
                    {
                      text: "Never show vulnerability (so you stay hidden)",
                      subtext: "The mask becomes your prison",
                    },
                    {
                      text: "Compare yourself through titles and benchmarks",
                      subtext: "Success defined by others, not you",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3 group/item">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm mt-0.5">
                        ✗
                      </span>
                      <div>
                        <p className="text-gray-700 font-medium leading-relaxed group-hover/item:text-gray-900 transition-colors">
                          {item.text}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 italic">
                          {item.subtext}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Solutions */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-mpp-yellow/30 to-mpp-orange/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-gradient-to-br from-mpp-yellow/5 via-white to-mpp-orange/5 p-8 lg:p-10 rounded-3xl border-2 border-mpp-yellow/30 shadow-xl hover:shadow-2xl hover:border-mpp-yellow/50 transition-all duration-300 h-full">
                <div className="flex items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-mpp-yellow to-mpp-orange bg-clip-text text-transparent mb-2">
                      Why MyPurposeProfile™ Works
                    </h3>
                    <p className="text-gray-700 font-medium">
                      Built by (ex) corporate professionals, for you
                    </p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-mpp-yellow/50 via-mpp-orange/50 to-mpp-yellow/50 mb-6" />

                <div className="space-y-4">
                  {[
                    {
                      text: "Rewires corporate caution into entrepreneurial confidence",
                      subtext: "Turn your analytical mind into your superpower",
                    },
                    {
                      text: "Builds self-trust by revealing your natural leadership style",
                      subtext:
                        "Stop seeking permission, start making decisions",
                    },
                    {
                      text: "Shows which business truly fits your psychology",
                      subtext: "Not what sounds good, but what works for YOU",
                    },
                    {
                      text: "Transforms fear into action with a 90-day roadmap",
                      subtext: "Concrete steps, not vague inspiration",
                    },
                    {
                      text: "Breaks through safety patterns disguised as preparation",
                      subtext: "Move from planning mode to building mode",
                    },
                    {
                      text: "Enables you to release the masks and show up as yourself",
                      subtext:
                        "Your authenticity becomes your competitive advantage",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3 group/item">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white font-bold text-sm mt-0.5 shadow-md">
                        ✓
                      </span>
                      <div>
                        <p className="text-gray-800 font-semibold leading-relaxed group-hover/item:bg-gradient-to-r group-hover/item:from-mpp-yellow group-hover/item:to-mpp-orange group-hover/item:bg-clip-text group-hover/item:text-transparent transition-all">
                          {item.text}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 italic">
                          {item.subtext}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
