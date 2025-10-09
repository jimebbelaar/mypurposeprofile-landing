"use client";

import { AlertCircle } from "lucide-react";

const problems = [
  { emoji: "😔", bold: "The pit in your stomach", rest: "as another weekend ends", type: "red" },
  { emoji: "📊", bold: "Another week of meaningless PowerPoints", rest: "no one will read", type: "yellow" },
  { emoji: "🎭", bold: "Putting on your corporate mask", rest: "for another performance review", type: "red" },
  { emoji: "💭", bold: "Scrolling LinkedIn", rest: "seeing people who \"made it out\"", type: "yellow" },
  { emoji: "📚", bold: "Your 47th business book", rest: "gathering dust on the nightstand", type: "red" },
  { emoji: "⏰", bold: '"Maybe next year"', rest: "- what you've said for the last 3 years", type: "yellow" },
  { emoji: "🔒", bold: "Golden handcuffs", rest: "getting tighter with each promotion", type: "red" },
  { emoji: "❓", bold: '"Who am I without my title?"', rest: "- the question that haunts you", type: "yellow" },
];

export default function ProblemSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-mpp-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-mpp-yellow/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="indicator-red px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              The Weekly Struggle
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl mb-4">
            Recognize this <span className="gradient-text">feeling?</span>
          </h2>
          <p className="text-xl text-gray-600">
            It's Sunday Night. Again.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {problems.map((problem, index) => {
            return (
              <div
                key={index}
                className={`glass-effect p-6 rounded-xl flex items-start gap-4 border transition-all hover:scale-[1.02] ${
                  problem.type === "red"
                    ? "border-mpp-red/20 hover:border-mpp-red/30"
                    : "border-mpp-yellow/20 hover:border-mpp-yellow/30"
                }`}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-2xl">{problem.emoji}</span>
                </div>
                <p className="pt-1">
                  <span className="font-extrabold text-base">{problem.bold}</span>
                  <span className="text-gray-700"> {problem.rest}</span>
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="inline-block glass-effect px-8 py-4 rounded-full border border-mpp-green/30">
            <p className="text-lg md:text-xl font-semibold">
              You're <span className="text-mpp-green">NOT</span> lazy. You're <span className="text-mpp-green">NOT</span> ungrateful.
              You're exhausted from pretending this is enough.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}