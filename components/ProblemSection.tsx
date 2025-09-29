import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { AlertCircle } from "lucide-react";

const problems = [
  {
    emoji: "😤",
    text: "You start 10 projects, finish 0. It feels like failing, every single time.",
    type: "red",
  },
  {
    emoji: "🌙",
    text: "3 AM: brilliant ideas. 9 AM: zero energy to start.",
    type: "yellow",
  },
  {
    emoji: "💸",
    text: "You watch others make $10K/month with 'simple' systems. You can't even last a week.",
    type: "red",
  },
  {
    emoji: "🎯",
    text: "Hyperfocus on the wrong things. 12 hours on a logo, 0 minutes on sales.",
    type: "yellow",
  },
  {
    emoji: "📚",
    text: "You buy another course. After 2 weeks it joins the other 47 unfinished ones.",
    type: "red",
  },
  {
    emoji: "🎭",
    text: "Imposter syndrome: Outside you look successful. Inside it's chaos and energy drinks.",
    type: "yellow",
  },
  {
    emoji: "🧠",
    text: "You know you're smart. But you feel stupid because you can't do 'simple' tasks.",
    type: "red",
  },
  {
    emoji: "🔄",
    text: "Constantly trying new strategies. Never long enough to see results.",
    type: "yellow",
  },
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
              The daily ADHD struggle
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black mb-4">
            Recognize This <span className="gradient-text">Feeling?</span>
          </h2>
          <p className="text-xl text-gray-400">
            You're not lazy. Your brain just works differently.
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
                <p className="text-gray-300 pt-1">{problem.text}</p>
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
              This is <span className="text-adhd-green">NOT</span> your fault.
              You just never learned how to work{" "}
              <span className="text-adhd-green">WITH</span> your ADHD brain
              instead of against it.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
