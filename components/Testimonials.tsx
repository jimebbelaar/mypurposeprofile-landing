// components/Testimonials.tsx
"use client"; // Add this if you're using app router

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image"; // Make sure this import is at the top

const testimonials = [
  {
    title: "$4,500 in 4 days",
    content:
      "When I finally stopped masking and just showed up as myself, everything started to click. In just 4 days I booked 7 calls and closed 6 ($4,500)—after months of overthinking, doubting, and holding myself back.",
    name: "Garreth Tinker",
    role: "The Chemistry Coach",
    image: "/images/garreth.jpg",
  },
  {
    title: "From chaos to clarity",
    content:
      "I thought I'd be fighting ADHD forever after my diagnosis. Jim's program showed me there's nothing wrong with me - I just needed systems that match my brain. The inside-out approach changed everything. No more grinding against myself.",
    name: "Julian Noriega",
    role: "Health & Performance Coach",
    image: "/images/julian.jpg",
  },
  {
    title: "Identity-first breakthrough",
    content:
      "In our 1:1 session, we dove deep immediately—no surface-level tips. He's walked the ADHD entrepreneur path himself and knows what truly works. What stood out: it's not about another productivity hack but starts with identity.",
    name: "Marc van Weeren",
    role: "Founder, Archwork",
    image: "/images/marc.jpg",
  },
];

export default function Testimonials() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl lg:text-5xl font-black text-center mb-16"
        >
          <span className="gradient-text">ADHD Entrepreneurs</span> Who Broke
          Their Pattern
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="bg-gradient-to-br from-adhd-yellow/5 to-black/50 rounded-2xl p-8 border border-adhd-yellow/20 hover:shadow-[0_20px_40px_rgba(255,215,0,0.2)] transition-all"
            >
              <div className="mb-6">
                <div className="text-3xl font-bold text-adhd-yellow mb-2">
                  {testimonial.title}
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
