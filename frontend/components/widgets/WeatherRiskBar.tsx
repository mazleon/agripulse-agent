"use client";
import { AlertOctagon, Umbrella, X, Droplets } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { TTSButton } from "./TTSButton";

export interface WeatherRiskData {
  risk_level: "red" | "orange" | "yellow";
  event_name: string;
  action_suggested: string;
  action_type: "cover" | "drain" | "harvest";
  countdown_minutes: number;
}

export function WeatherRiskBar({ data }: { data: WeatherRiskData }) {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(data.countdown_minutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!isVisible) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const bgClass =
    data.risk_level === "red"
      ? "bg-neon-red/90"
      : data.risk_level === "orange"
        ? "bg-earth-500/90"
        : "bg-neon-yellow/90";
  const borderClass =
    data.risk_level === "red"
      ? "border-neon-red"
      : data.risk_level === "orange"
        ? "border-earth-300"
        : "border-neon-yellow";
  const textClass =
    data.risk_level === "yellow" ? "text-agri-dark" : "text-white";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className={`w-full ${bgClass} backdrop-blur-md border-b-2 ${borderClass} px-4 py-3 flex items-center justify-between shadow-lg relative z-40`}
      >
        <div className={`flex items-center gap-3 ${textClass}`}>
          <div className="bg-black/20 p-2 rounded-full">
            {data.action_type === "cover" ? (
              <Umbrella size={24} />
            ) : data.action_type === "drain" ? (
              <Droplets size={24} />
            ) : (
              <AlertOctagon size={24} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide uppercase">
                {data.event_name}
              </h3>
              <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-xs font-bold tracking-widest">
                {timeString}
              </span>
            </div>
            <p className="text-xs font-medium opacity-90 mt-0.5">
              {data.action_suggested}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="scale-75 origin-right">
            <TTSButton
              text={`সতর্কতা: ${data.event_name} আসছে। ${data.action_suggested}`}
            />
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className={`p-1.5 bg-black/20 hover:bg-black/40 rounded-full transition-colors ${textClass}`}
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
