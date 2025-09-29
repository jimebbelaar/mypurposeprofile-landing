"use client";

import { useEffect } from "react";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import ProblemSection from "@/components/ProblemSection";
import Solution from "@/components/Solution";
import ValueStack from "@/components/ValueStack";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import CountdownTimer from "@/components/CountdownTimer";
import { trackEvent, initTracking } from "@/lib/meta-pixel";
import { motion } from "framer-motion";

export default function Home() {
  useEffect(() => {
    initTracking();

    // Track scroll depth
    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll >= 25 && maxScroll < 50) {
          trackEvent("ScrollDepth25");
        } else if (maxScroll >= 50 && maxScroll < 75) {
          trackEvent("ScrollDepth50");
        } else if (maxScroll >= 75 && maxScroll < 90) {
          trackEvent("ScrollDepth75");
        } else if (maxScroll >= 90) {
          trackEvent("ScrollDepth90");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Track time on page
    const startTime = Date.now();
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent("TimeOnPage", { seconds: timeSpent });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <>
      <CountdownTimer />
      <main className="min-h-screen">
        <Hero />
        <Testimonials />
        <ProblemSection />
        <Solution />
        <ValueStack />
        <FAQ />
        <FinalCTA />
      </main>
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="mb-4">© 2025 ADHD Harmony</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="/terms" className="hover:text-adhd-yellow transition">
              Terms of Use
            </a>
            <a href="/privacy" className="hover:text-adhd-yellow transition">
              Privacy Policy
            </a>
            <a href="/cookies" className="hover:text-adhd-yellow transition">
              Cookie Policy
            </a>
          </div>
          <p className="mt-4 text-xs">
            This is not medical advice. Results vary per person.
          </p>
        </div>
      </footer>
    </>
  );
}
