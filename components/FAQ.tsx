// ================
// components/FAQ.tsx
// ================
'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What if I quit halfway through like always?',
    answer: "That's exactly why I designed this differently. The videos are short (max 15 min each), the AI conversation is engaging (like talking to a friend), and you get your report instantly. No waiting, no overwhelm, just quick wins that build momentum."
  },
  {
    question: 'Why does this work when nothing else has?',
    answer: 'Because we start with WHO you are, not WHAT to do. Every other system tries to force you into their box. We build YOUR box, designed for YOUR brain, YOUR energy patterns, YOUR strengths.'
  },
  {
    question: 'Do I need an official ADHD diagnosis?',
    answer: 'No. If you recognize yourself in the struggles I described, this is for you. Many successful entrepreneurs have ADHD traits without official diagnosis. This system works for anyone who thinks differently.'
  },
  {
    question: 'What exactly do I get for $27?',
    answer: '3 video modules (45 min total), AI voice analysis session, your personal transformation report, 90-day action plan, and a bonus 1-on-1 call with me. Everything is instantly accessible after purchase.'
  },
  {
    question: 'Is my privacy protected with the AI?',
    answer: '100%. The AI conversation is completely private and encrypted. Your data is never shared, sold, or used for anything except generating your personal report. You can delete everything with one click.'
  },
  {
    question: "What if it doesn't work for me?",
    answer: "30-day money-back guarantee, no questions asked. If you don't get value, you don't pay. But honestly? If you complete the 60-minute process, you'll have insights worth 100x the price."
  }
]

export default function FAQ() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  return (
    <section ref={ref} className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl lg:text-5xl font-black text-center mb-16"
        >
          Questions? <span className="gradient-text">I Get It.</span>
        </motion.h2>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full glass-effect rounded-xl overflow-hidden text-left"
              >
                <div className="p-6 font-semibold text-lg flex justify-between items-center hover:text-adhd-yellow transition">
                  {faq.question}
                  <ChevronDown 
                    className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                  />
                </div>
                {openIndex === index && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 text-gray-300"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
