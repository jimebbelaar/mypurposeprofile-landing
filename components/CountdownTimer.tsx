// components/CountdownTimer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { paymentModalEvents } from "@/components/EmbeddedCheckoutForm";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [spotsLeft, setSpotsLeft] = useState(5);
  const [showNotification, setShowNotification] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const simulationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Subscribe to payment modal events
  useEffect(() => {
    const unsubscribe = paymentModalEvents.subscribe((isOpen) => {
      setIsPaymentModalOpen(isOpen);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isClient || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const calculateTimeUntilMidnightAmsterdam = () => {
      const now = new Date();
      const amsterdamTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" })
      );

      const midnight = new Date(amsterdamTime);
      midnight.setHours(24, 0, 0, 0);

      const difference = midnight.getTime() - amsterdamTime.getTime();

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
      if (typeof window === "undefined") {
        return 5;
      }

      try {
        const storedData = localStorage.getItem("countdownData");
        const now = Date.now();

        if (storedData) {
          const data = JSON.parse(storedData);
          const lastVisit = data.lastVisit || now;
          const lastSpots = data.lastSpots || 7;
          const visitCount = data.visitCount || 1;
          const hoursSinceLastVisit = (now - lastVisit) / (1000 * 60 * 60);

          if (hoursSinceLastVisit > 0.5) {
            let newSpots = lastSpots;

            if (hoursSinceLastVisit > 24) {
              newSpots = Math.max(2, Math.floor(Math.random() * 3) + 3);
            } else if (hoursSinceLastVisit > 4) {
              newSpots = Math.max(2, lastSpots - 2);
            } else if (hoursSinceLastVisit > 1) {
              newSpots = Math.max(2, lastSpots - 1);
            }

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
            return lastSpots;
          }
        }
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      }

      let baseSpots = 7;

      if (currentHour >= 0 && currentHour < 6) {
        baseSpots = Math.floor(Math.random() * 3) + 5;
      } else if (currentHour >= 6 && currentHour < 10) {
        baseSpots = Math.floor(Math.random() * 3) + 4;
      } else if (currentHour >= 10 && currentHour < 14) {
        baseSpots = Math.floor(Math.random() * 3) + 3;
      } else if (currentHour >= 14 && currentHour < 18) {
        baseSpots = Math.floor(Math.random() * 2) + 3;
      } else if (currentHour >= 18 && currentHour < 22) {
        baseSpots = Math.floor(Math.random() * 2) + 2;
      } else {
        baseSpots = Math.floor(Math.random() * 2) + 3;
      }

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseSpots = Math.min(7, baseSpots + 1);
      }

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

    const timeData = calculateTimeUntilMidnightAmsterdam();
    setTimeLeft({
      hours: timeData.hours,
      minutes: timeData.minutes,
      seconds: timeData.seconds,
    });

    const initialSpots = calculateSmartSpotsLeft(
      timeData.currentHour,
      timeData.dayOfWeek
    );
    setSpotsLeft(initialSpots);

    const timer = setInterval(() => {
      const newTimeData = calculateTimeUntilMidnightAmsterdam();
      setTimeLeft({
        hours: newTimeData.hours,
        minutes: newTimeData.minutes,
        seconds: newTimeData.seconds,
      });
    }, 1000);

    const simulatePurchase = () => {
      try {
        const storedData = localStorage.getItem("countdownData");
        const hasSeenPurchase = localStorage.getItem("hasSeenPurchase");

        if (!hasSeenPurchase && storedData) {
          const data = JSON.parse(storedData);
          const currentSpots = data.lastSpots;

          if (currentSpots > 2) {
            const delay = 15000 + Math.random() * 20000;

            simulationTimeoutRef.current = setTimeout(() => {
              setSpotsLeft((current) => {
                const newSpots = Math.max(2, current - 1);

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

                  localStorage.setItem("hasSeenPurchase", "true");
                } catch (error) {
                  console.error("Error updating localStorage:", error);
                }

                setShowNotification(true);
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

    simulatePurchase();

    const periodicUpdate = setInterval(() => {
      const chance = Math.random();
      if (chance < 0.2) {
        setSpotsLeft((current) => {
          if (current > 2) {
            const newSpots = current - 1;

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
    }, 5 * 60 * 1000);

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
        className={`fixed top-0 left-0 right-0 ${
          isPaymentModalOpen ? "z-30" : "z-50"
        }`}
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
                initial={isClient ? { scale: 0.8, opacity: 0 } : undefined}
                animate={{ scale: 1, opacity: 1 }}
                exit={isClient ? { scale: 1.2, opacity: 0 } : undefined}
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
        {showNotification && !isPaymentModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-16 left-1/2 transform -translate-x-1/2 ${
              isPaymentModalOpen ? "z-30" : "z-50"
            } px-4 py-2 rounded-lg`}
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
