// components/Testimonials.tsx
"use client";

import Image from "next/image";

const testimonials = [
  {
    title:
      "I finally saw the patterns and where my real passion had been all along.",
    content: " Now I’m building something that gives me energy every day.",
    name: "Luuk Alleman",
    role: "Founder, Everyman AI",
    image: "/images/luuk.png",
  },
  {
    title: "I needed clarity on my values and direction.",
    content:
      "The report was remarkably accurate and gave me a concrete action plan. Four months later, I’m still executing without wavering.",
    name: "Sophie-Anne Onland",
    role: "SOOPH",
    image: "/images/sophie.jpg",
  },
  {
    title: "It articulated what I knew deep down but couldn’t express.",
    content:
      "More flow, confidence, and meaning — decisions now fit who I actually am.",
    name: "Tony van der Zanden",
    role: "Rol?",
    image: "/images/tony.jpg",
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
