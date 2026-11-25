"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/lib/useLocalStorage";

const GOAL = 8;

export default function WaterTracker() {
  const [glasses, setGlasses] = useLocalStorage("opslife-water", 0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setPulse(true), 45 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`rounded-2xl p-5 bg-blue-50 border border-blue-200 ${pulse ? "animate-bounce" : ""}`}>
      <h2 className="font-bold text-blue-900 mb-3">💧 Hydration — {glasses}/{GOAL} glasses</h2>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: GOAL }).map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.8 }}
            onClick={() => setGlasses(i + 1 === glasses ? i : i + 1)}
            className="w-9 h-12 rounded-b-xl rounded-t-md border-2 border-blue-400 overflow-hidden relative"
            aria-label={`Glass ${i + 1}`}
          >
            {i < glasses && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                className="absolute bottom-0 w-full bg-blue-400/70"
              />
            )}
          </motion.button>
        ))}
      </div>
      <button onClick={() => setPulse(false)} className="text-xs mt-2 text-blue-600 underline">
        Dismiss reminder
      </button>
    </div>
  );
}
