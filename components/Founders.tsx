"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";

const founders = [
  {
    name: "Michel Breeuwer",
    role: "From FinTech Executive to Purpose Pioneer",
    image: "/images/michel.jpeg",
    bio: "Held global leadership roles at billion-dollar FinTech scaleups — but still felt empty inside. Quit to find his purpose, now helps corporate professionals escape the golden handcuffs and build businesses that align success with fulfillment.",
  },
  {
    name: "Anouk Hooijschuur",
    role: "Ex Big Four Turned Purpose Guide",
    image: "/images/anouk.jpeg",
    bio: "Digital business consultant and software developer who helps you discover what makes you unique — and turn it into a business that provides both financial freedom and deep fulfillment. Specializes in bringing mind, body, and business into harmony.",
  },
  {
    name: "Jim Ebbelaar",
    role: "ADHD Founder of 7-Figure Agency",
    image: "/images/jim.jpg",
    bio: "Built Seamless, a 7-figure digital agency, while battling ADHD and self-doubt. Now uses that experience to help entrepreneurs break through limiting beliefs and discover their real identity — so they can finally build the business they deserve.",
  },
];

export default function Founders() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-mpp-yellow/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mpp-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="indicator-yellow px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Meet Your Guides
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl mb-4">
            Built by{" "}
            <span className="gradient-text">
              former corporate professionals
            </span>{" "}
            who made the leap
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Three entrepreneurs who've walked your path and dedicated their
            lives to helping others find their purpose and build businesses that
            matter
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {founders.map((founder, index) => (
            <div
              key={index}
              className="glass-effect rounded-2xl p-8 border border-mpp-yellow/20 transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(124,58,237,0.2)] flex flex-col"
            >
              {/* Image */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-mpp-yellow to-mpp-orange rounded-full blur-md opacity-50"></div>
                <Image
                  src={founder.image}
                  alt={founder.name}
                  fill
                  sizes="128px"
                  className="rounded-full object-cover relative z-10 ring-4 ring-white/80"
                />
              </div>

              {/* Name & Role */}
              <div className="text-center mb-4">
                <h3 className="text-2xl font-black mb-2">{founder.name}</h3>
                <p className="text-sm font-semibold text-mpp-yellow mb-4">
                  {founder.role}
                </p>
              </div>

              {/* Bio */}
              <p className="text-gray-700 leading-relaxed flex-grow text-center">
                {founder.bio}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-block glass-effect px-8 py-4 rounded-full border border-mpp-yellow/30">
            <p className="text-lg md:text-xl font-semibold">
              We've been where you are.{" "}
              <span className="gradient-text">
                Let us show you the way out.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
