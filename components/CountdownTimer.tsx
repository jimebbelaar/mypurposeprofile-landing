// components/CountdownTimer.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [spotsLeft, setSpotsLeft] = useState(7);

  useEffect(() => {
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
      };
    };

    const calculateSpotsLeft = (hoursUntilMidnight: number) => {
      // Start with 7 spots at midnight, decrease to 3 throughout the day
      // Never go below 3 spots
      const totalDayHours = 24;
      const spotsRange = 7 - 3; // Range from 7 to 3 = 4 spots variation
      const hoursPassed = totalDayHours - hoursUntilMidnight;

      // Linear decrease from 7 to 3 over 24 hours
      // At midnight (0 hours passed): 7 spots
      // At end of day (24 hours passed): 3 spots
      const spots = Math.max(
        3,
        Math.round(7 - (hoursPassed / totalDayHours) * spotsRange)
      );

      return spots;
    };

    // Update immediately
    const timeData = calculateTimeUntilMidnightAmsterdam();
    setTimeLeft({
      hours: timeData.hours,
      minutes: timeData.minutes,
      seconds: timeData.seconds,
    });
    setSpotsLeft(calculateSpotsLeft(timeData.totalHours));

    // Update every second
    const timer = setInterval(() => {
      const timeData = calculateTimeUntilMidnightAmsterdam();
      setTimeLeft({
        hours: timeData.hours,
        minutes: timeData.minutes,
        seconds: timeData.seconds,
      });

      // Update spots every minute to create urgency
      if (timeData.seconds === 0) {
        setSpotsLeft(calculateSpotsLeft(timeData.totalHours));
      }
    }, 1000);

    // Update spots every 30 minutes for more realistic countdown
    const spotsTimer = setInterval(() => {
      const timeData = calculateTimeUntilMidnightAmsterdam();
      setSpotsLeft(calculateSpotsLeft(timeData.totalHours));
    }, 30 * 60 * 1000); // 30 minutes

    return () => {
      clearInterval(timer);
      clearInterval(spotsTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-adhd-yellow/20"
    >
      <div className="container mx-auto px-3 py-2 flex flex-row items-center justify-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
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
          <span className="text-adhd-yellow font-bold text-xs sm:text-sm">
            {spotsLeft} SPOTS LEFT TODAY
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            Discound ends in:
          </span>
          <div className="flex gap-1">
            <span className="px-1 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-adhd-yellow font-bold bg-adhd-yellow/10 border border-adhd-yellow/30 text-xs sm:text-sm">
              {String(timeLeft.hours).padStart(2, "0")}
            </span>
            <span className="text-adhd-yellow text-xs sm:text-sm">:</span>
            <span className="px-1 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-adhd-yellow font-bold bg-adhd-yellow/10 border border-adhd-yellow/30 text-xs sm:text-sm">
              {String(timeLeft.minutes).padStart(2, "0")}
            </span>
            <span className="text-adhd-yellow text-xs sm:text-sm">:</span>
            <span className="px-1 sm:px-2 py-0.5 sm:py-1 rounded font-mono text-adhd-yellow font-bold bg-adhd-yellow/10 border border-adhd-yellow/30 text-xs sm:text-sm">
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
