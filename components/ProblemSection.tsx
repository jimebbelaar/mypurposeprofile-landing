import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
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
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 relative">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-adhd-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-adhd-yellow/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="indicator-red px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              The Weekly Struggle
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            Recognize This <span className="gradient-text">Feeling?</span>
          </h2>
          <p className="text-xl text-gray-600">
            It's Sunday Night. Again.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {problems.map((problem, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`glass-effect p-6 rounded-xl flex items-start gap-4 border transition-all hover:scale-[1.02] ${
                  problem.type === "red"
                    ? "border-adhd-red/20 hover:border-adhd-red/30"
                    : "border-adhd-yellow/20 hover:border-adhd-yellow/30"
                }`}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-2xl">{problem.emoji}</span>
                </div>
                <p className="text-gray-900 pt-1">
                  <span className="font-extrabold">{problem.bold}</span>
                  <span className="text-gray-700"> {problem.rest}</span>
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="inline-block glass-effect px-8 py-4 rounded-full border border-adhd-green/30">
            <p className="text-xl font-semibold">
              You're <span className="text-mpp-green">NOT</span> lazy. You're <span className="text-mpp-green">NOT</span> ungrateful.
              You're exhausted from pretending this is enough.

            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
