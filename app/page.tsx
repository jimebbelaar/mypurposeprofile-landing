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

export default function Home() {
  useEffect(() => {
    // Initialize and track PageView once
    initTracking();

    // Track scroll depth with proper flags
    const scrollTracked = {
      depth25: false,
      depth50: false,
      depth75: false,
      depth90: false,
    };

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Debounce scroll events
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent =
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
          100;

        // Only track each depth once
        if (scrollPercent >= 25 && !scrollTracked.depth25) {
          scrollTracked.depth25 = true;
          trackEvent("ScrollDepth25");
          console.log("📊 Tracked: ScrollDepth25");
        }
        if (scrollPercent >= 50 && !scrollTracked.depth50) {
          scrollTracked.depth50 = true;
          trackEvent("ScrollDepth50");
          console.log("📊 Tracked: ScrollDepth50");
        }
        if (scrollPercent >= 75 && !scrollTracked.depth75) {
          scrollTracked.depth75 = true;
          trackEvent("ScrollDepth75");
          console.log("📊 Tracked: ScrollDepth75");
        }
        if (scrollPercent >= 90 && !scrollTracked.depth90) {
          scrollTracked.depth90 = true;
          trackEvent("ScrollDepth90");
          console.log("📊 Tracked: ScrollDepth90");
        }
      }, 100); // Debounce delay of 100ms
    };

    // Track ViewContent after small delay (user actually viewing)
    const viewContentTimeout = setTimeout(() => {
      trackEvent("ViewContent", {
        content_name: "ADHD Harmony Landing Page",
        content_category: "Landing Page",
      });
      console.log("📊 Tracked: ViewContent");
    }, 3000); // After 3 seconds on page

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Track time on page
    const startTime = Date.now();
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      trackEvent("TimeOnPage", { seconds: timeSpent });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(viewContentTimeout);
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
