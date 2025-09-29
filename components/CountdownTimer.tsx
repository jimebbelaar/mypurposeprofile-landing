// components/CountdownTimer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [spotsLeft, setSpotsLeft] = useState(5); // Default value for SSR
  const [showNotification, setShowNotification] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track if we're on client
  const simulationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run this logic on the client and once
    if (!isClient || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const calculateTimeUntilMidnightAmsterdam = () => {
      // Get current time in Amsterdam timezone
      const now = new Date();
      const amsterdamTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" })
      );

      // Create midnight time for Amsterdam (next day)
      const midnight = new Date(amsterdamTime);
      midnight.setHours(24, 0, 0, 0); // Set to next midnight

      // Calculate difference in milliseconds
      const difference = midnight.getTime() - amsterdamTime.getTime();

      // Convert to hours, minutes, seconds
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        hours,
        minutes,
        seconds,
        totalHours: hours + minutes / 60 + seconds / 3600,
        currentHour: amsterdamTime.getHours(),
        dayOfWeek: amsterdamTime.getDay(),
      };
    };

    const calculateSmartSpotsLeft = (
      currentHour: number,
      dayOfWeek: number
    ) => {
      // More realistic spot allocation based on time of day
      // Peak hours (evening) have fewer spots, quiet hours have more

      // Check if localStorage is available (client-side only)
      if (typeof window === "undefined") {
        return 5; // Default for SSR
      }

      // Get stored data from localStorage
      try {
        const storedData = localStorage.getItem("countdownData");
        const now = Date.now();

        if (storedData) {
          const data = JSON.parse(storedData);
          const lastVisit = data.lastVisit || now;
          const lastSpots = data.lastSpots || 7;
          const visitCount = data.visitCount || 1;
          const hoursSinceLastVisit = (now - lastVisit) / (1000 * 60 * 60);

          // If returning visitor
          if (hoursSinceLastVisit > 0.5) {
            // More than 30 minutes ago
            // Always show fewer or same spots for returning visitors
            let newSpots = lastSpots;

            if (hoursSinceLastVisit > 24) {
              // Next day, reset but start lower
              newSpots = Math.max(2, Math.floor(Math.random() * 3) + 3); // 3-5 spots
            } else if (hoursSinceLastVisit > 4) {
              // Several hours later, definitely fewer
              newSpots = Math.max(2, lastSpots - 2);
            } else if (hoursSinceLastVisit > 1) {
              // An hour or more later, reduce by 1
              newSpots = Math.max(2, lastSpots - 1);
            }

            // Store updated data
            localStorage.setItem(
              "countdownData",
              JSON.stringify({
                lastVisit: now,
                lastSpots: newSpots,
                visitCount: visitCount + 1,
                lastHour: currentHour,
              })
            );

            return newSpots;
          } else {
            // Same session, return stored value
            return lastSpots;
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      }

      // First time visitor or no stored data
      let baseSpots = 7;

      // Time-based allocation (Amsterdam time)
      if (currentHour >= 0 && currentHour < 6) {
        // Night: 5-7 spots
        baseSpots = Math.floor(Math.random() * 3) + 5;
      } else if (currentHour >= 6 && currentHour < 10) {
        // Morning: 4-6 spots
        baseSpots = Math.floor(Math.random() * 3) + 4;
      } else if (currentHour >= 10 && currentHour < 14) {
        // Midday: 3-5 spots
        baseSpots = Math.floor(Math.random() * 3) + 3;
      } else if (currentHour >= 14 && currentHour < 18) {
        // Afternoon: 3-4 spots
        baseSpots = Math.floor(Math.random() * 2) + 3;
      } else if (currentHour >= 18 && currentHour < 22) {
        // Peak evening: 2-3 spots (highest urgency)
        baseSpots = Math.floor(Math.random() * 2) + 2;
      } else {
        // Late evening: 3-4 spots
        baseSpots = Math.floor(Math.random() * 2) + 3;
      }

      // Weekend adjustment (slightly more spots on weekends)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseSpots = Math.min(7, baseSpots + 1);
      }

      // Store initial data
      try {
        localStorage.setItem(
          "countdownData",
          JSON.stringify({
            lastVisit: Date.now(),
            lastSpots: baseSpots,
            visitCount: 1,
            lastHour: currentHour,
          })
        );
      } catch (error) {
        console.error("Error setting localStorage:", error);
      }

      return baseSpots;
    };

    // Initialize time and spots
    const timeData = calculateTimeUntilMidnightAmsterdam();
    setTimeLeft({
      hours: timeData.hours,
      minutes: timeData.minutes,
      seconds: timeData.seconds,
    });

    // Set initial spots based on smart calculation
    const initialSpots = calculateSmartSpotsLeft(
      timeData.currentHour,
      timeData.dayOfWeek
    );
    setSpotsLeft(initialSpots);

    // Update timer every second
    const timer = setInterval(() => {
      const newTimeData = calculateTimeUntilMidnightAmsterdam();
      setTimeLeft({
        hours: newTimeData.hours,
        minutes: newTimeData.minutes,
        seconds: newTimeData.seconds,
      });
    }, 1000);

    // Simulate dynamic purchases
    const simulatePurchase = () => {
      // Check if we should simulate a purchase
      try {
        const storedData = localStorage.getItem("countdownData");
        const hasSeenPurchase = localStorage.getItem("hasSeenPurchase");

        if (!hasSeenPurchase && storedData) {
          const data = JSON.parse(storedData);
          const currentSpots = data.lastSpots;

          // Only simulate if there are more than 2 spots
          if (currentSpots > 2) {
            // Random delay between 15-35 seconds
            const delay = 15000 + Math.random() * 20000;

            simulationTimeoutRef.current = setTimeout(() => {
              setSpotsLeft((current) => {
                const newSpots = Math.max(2, current - 1);

                // Update localStorage
                try {
                  const storedData = localStorage.getItem("countdownData");
                  if (storedData) {
                    const data = JSON.parse(storedData);
                    localStorage.setItem(
                      "countdownData",
                      JSON.stringify({
                        ...data,
                        lastSpots: newSpots,
                      })
                    );
                  }

                  // Mark that user has seen a purchase this session
                  localStorage.setItem("hasSeenPurchase", "true");
                } catch (error) {
                  console.error("Error updating localStorage:", error);
                }

                setShowNotification(true);

                // Hide notification after 4 seconds
                setTimeout(() => setShowNotification(false), 4000);

                return newSpots;
              });
            }, delay);
          }
        }
      } catch (error) {
        console.error("Error in purchase simulation:", error);
      }
    };

    // Run purchase simulation
    simulatePurchase();

    // Periodically update spots (every 5 minutes) to simulate other purchases
    const periodicUpdate = setInterval(() => {
      const chance = Math.random();
      // 20% chance to decrease spots every 5 minutes
      if (chance < 0.2) {
        setSpotsLeft((current) => {
          if (current > 2) {
            const newSpots = current - 1;

            // Update localStorage
            try {
              const storedData = localStorage.getItem("countdownData");
              if (storedData) {
                const data = JSON.parse(storedData);
                localStorage.setItem(
                  "countdownData",
                  JSON.stringify({
                    ...data,
                    lastSpots: newSpots,
                  })
                );
              }
            } catch (error) {
              console.error("Error updating localStorage:", error);
            }

            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 4000);

            return newSpots;
          }
          return current;
        });
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    // Clear session marker on page unload
    const handleUnload = () => {
      try {
        localStorage.removeItem("hasSeenPurchase");
      } catch (error) {
        console.error("Error clearing session marker:", error);
      }
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(timer);
      clearInterval(periodicUpdate);
      window.removeEventListener("beforeunload", handleUnload);
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
    };
  }, [isClient]);

  return (
    <>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: "rgba(10, 10, 10, 0.4)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 204, 0, 0.15)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255, 204, 0, 0.03), transparent)",
          }}
        />

        <div className="container mx-auto px-3 py-2 flex flex-row items-center justify-center gap-3 sm:gap-6 relative">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{
                background: "linear-gradient(45deg, #ff3333, #ff6666)",
                boxShadow:
                  "0 0 20px rgba(255, 51, 51, 0.7), 0 0 40px rgba(255, 51, 51, 0.4)",
              }}
              animate={{
                opacity: [1, 0.3, 1],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={spotsLeft}
                initial={isClient ? { scale: 0.8, opacity: 0 } : false}
                animate={{ scale: 1, opacity: 1 }}
                exit={isClient ? { scale: 1.2, opacity: 0 } : false}
                transition={{ duration: 0.3 }}
                className="text-adhd-yellow font-bold text-xs sm:text-sm drop-shadow-[0_2px_10px_rgba(255,204,0,0.5)]"
              >
                {spotsLeft === 2
                  ? "ONLY 2 SPOTS LEFT!"
                  : spotsLeft === 1
                  ? "LAST SPOT AVAILABLE!"
                  : `${spotsLeft} SPOTS LEFT TODAY`}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-300 opacity-80">
              Discount ends in:
            </span>
            <div className="flex gap-1">
              <span
                className="px-1 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-adhd-yellow font-bold text-xs sm:text-sm"
                style={{
                  background: "rgba(255, 204, 0, 0.08)",
                  border: "1px solid rgba(255, 204, 0, 0.25)",
                  boxShadow: "inset 0 1px 2px rgba(255, 204, 0, 0.1)",
                }}
              >
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-adhd-yellow text-xs sm:text-sm opacity-60">
                :
              </span>
              <span
                className="px-1 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-adhd-yellow font-bold text-xs sm:text-sm"
                style={{
                  background: "rgba(255, 204, 0, 0.08)",
                  border: "1px solid rgba(255, 204, 0, 0.25)",
                  boxShadow: "inset 0 1px 2px rgba(255, 204, 0, 0.1)",
                }}
              >
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-adhd-yellow text-xs sm:text-sm opacity-60">
                :
              </span>
              <span
                className="px-1 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-adhd-yellow font-bold text-xs sm:text-sm"
                style={{
                  background: "rgba(255, 204, 0, 0.08)",
                  border: "1px solid rgba(255, 204, 0, 0.25)",
                  boxShadow: "inset 0 1px 2px rgba(255, 204, 0, 0.1)",
                }}
              >
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Purchase simulation notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg"
            style={{
              background: "rgba(255, 204, 0, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 204, 0, 0.3)",
              boxShadow: "0 4px 20px rgba(255, 204, 0, 0.2)",
            }}
          >
            <span className="text-adhd-yellow text-sm font-semibold">
              ⚡ Someone just claimed their spot!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
