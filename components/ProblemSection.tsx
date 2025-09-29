// ================
// components/ProblemSection.tsx
// ================
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const problems = [
  { emoji: '😤', text: 'You start 10 projects, finish 0. It feels like failing, every single time.' },
  { emoji: '🌙', text: '3 AM: brilliant ideas. 9 AM: zero energy to start.' },
  { emoji: '💸', text: "You watch others make $10K/month with 'simple' systems. You can't even last a week." },
  { emoji: '🎯', text: 'Hyperfocus on the wrong things. 12 hours on a logo, 0 minutes on sales.' },
  { emoji: '📚', text: 'You buy another course. After 2 weeks it joins the other 47 unfinished ones.' },
  { emoji: '🎭', text: "Imposter syndrome: Outside you look successful. Inside it's chaos and energy drinks." },
  { emoji: '🧠', text: "You know you're smart. But you feel stupid because you can't do 'simple' tasks." },
  { emoji: '🔄', text: 'Constantly trying new strategies. Never long enough to see results.' },
]

export default function ProblemSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  
  return (
    <section ref={ref} className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-black text-center mb-4">
            Recognize This <span className="gradient-text">Feeling?</span>
          </h2>
          <p className="text-xl text-center text-gray-400 mb-16">
            You're not lazy. Your brain just works differently.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-effect p-6 rounded-xl border border-adhd-red/20 flex items-start gap-4"
            >
              <span className="text-adhd-red text-2xl">{problem.emoji}</span>
              <p className="text-gray-300">{problem.text}</p>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="inline-block glass-effect px-8 py-4 rounded-full border border-adhd-yellow/30">
            <p className="text-xl font-semibold">
              This is <span className="text-adhd-yellow">NOT</span> your fault. You just never learned how to work{' '}
              <span className="text-adhd-yellow">WITH</span> your ADHD brain instead of against it.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
