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
import { trackEvent } from "@/lib/meta-pixel";

export default function Home() {
  useEffect(() => {
    const scrollTracked = {
      depth25: false,
      depth50: false,
      depth75: false,
      depth90: false,
    };

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent =
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
          100;

        if (scrollPercent >= 90 && !scrollTracked.depth90) {
          scrollTracked.depth90 = true;
          trackEvent("ScrollDepth90");
        } else if (scrollPercent >= 75 && !scrollTracked.depth75) {
          scrollTracked.depth75 = true;
          trackEvent("ScrollDepth75");
        } else if (scrollPercent >= 50 && !scrollTracked.depth50) {
          scrollTracked.depth50 = true;
          trackEvent("ScrollDepth50");
        } else if (scrollPercent >= 25 && !scrollTracked.depth25) {
          scrollTracked.depth25 = true;
          trackEvent("ScrollDepth25");
        }
      }, 150);
    };

    const viewContentTimeout = setTimeout(() => {
      trackEvent("ViewContent", {
        content_name: "ADHD Harmony Landing Page",
        content_category: "Landing Page",
      });
    }, 3000);

    const startTime = Date.now();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        if (timeSpent > 5) {
          trackEvent("TimeOnPage", { seconds: timeSpent });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(scrollTimeout);
      clearTimeout(viewContentTimeout);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <CountdownTimer />
      {/* <StickyBottomCTA /> */}
      <main className="min-h-screen">
        <Hero />
        <Testimonials />
        <ProblemSection />
        <Solution />
        <ValueStack />
        <FAQ />
        <FinalCTA />
      </main>
      <footer className="py-12 border-t border-gray-200 pb-30">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-4">© 2025 MyPurposeProfile</p>
          <div className="flex justify-center gap-6 text-sm">
            <a
              href="https://www.mypurposeprofile.com/legal/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-mpp-yellow transition"
            >
              Terms of Use
            </a>
            <a
              href="https://www.mypurposeprofile.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-mpp-yellow transition"
            >
              Privacy Policy
            </a>
            <a
              href="https://www.adhdharmony.com/legal/ai-assessment-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-mpp-yellow transition"
            >
              AI Policy
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
