// components/Testimonials.tsx
"use client";

import Image from "next/image";

const testimonials = [
  {
    title: "From confusion to crystal-clear direction in just one assessment",
    content:
      "I was at a crossroads needing clarity on my values and goals for better decisions about work and personal growth. MyPurposeProfile's thoughtful questions led to a detailed, remarkably accurate report that didn't just give insights—it provided a concrete action plan. The assessment revealed surprising truths about what work suits me and which environments align with who I am. Four months later, I'm still actively pursuing the goals I formulated then without wavering.",
    name: "Sophie-Anne Onland",
    role: "The Chemistry Coach",
    image: "/images/sophie.jpg",
  },
  {
    title: "Finally understood who I really am and what I want",
    content:
      "MyPurposeProfile's insightful questions led to a personalized profile that was spot-on and helped me articulate what I knew deep down but couldn't express. The assessment revealed my strengths, showed me my blind spots, and gave me the clarity to make choices that truly fit me. Since completing it, I experience more flow, confidence, and meaning in my daily life—from career decisions to relationships, everything feels more aligned with who I actually am.",
    name: "Tony van der Zanden",
    role: "Health & Performance Coach",
    image: "/images/tony.jpg",
  },
  {
    title: "From unclear direction to building a business that truly fits",
    content:
      "I didn’t know what my sweet spot was or the direction for my business that truly fit me. Because of that, I could never fully commit. I was working hard, but not for something I fully stood behind. During this process, I slowly started to see the patterns, and where my real passion had been all along. What really clicked was connecting my personality to concrete decisions. Suddenly it became obvious which path made sense. Now I’m building something that gives me energy every single day.",
    name: "Luuk Alleman",
    role: "Founder, Everyman AI",
    image: "/images/luuk.png",
  },
];

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl lg:text-5xl text-center font-heading font-medium mb-16">
          <span className="gradient-text">Entrepreneurs</span> Who Escaped the
          Corporate Trap
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="glass-effect rounded-2xl p-8 border border-mpp-yellow/20 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(124,58,237,0.2)]"
            >
              <div className="mb-6">
                <h3 className="text-3xl font-black text-mpp-yellow mb-2">
                  {t.title}
                </h3>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">{t.content}</p>

              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="48px"
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
