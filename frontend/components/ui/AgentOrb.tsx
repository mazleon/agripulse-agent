"use client";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useState } from "react";

interface AgentOrbProps {
  status: "idle" | "listening" | "processing" | "alert";
  onPressStart?: () => void;
  onPressEnd?: () => void;
}

export function AgentOrb({ status, onPressStart, onPressEnd }: AgentOrbProps) {
  const getOrbColor = () => {
    switch (status) {
      case "listening":
        return "rgba(57, 255, 20, 1)"; // Neon Green
      case "processing":
        return "rgba(0, 243, 255, 1)"; // Neon Blue
      case "alert":
        return "rgba(255, 0, 85, 1)"; // Neon Red
      default:
        return "rgba(57, 255, 20, 0.5)"; // Idle Green
    }
  };

  const getShadowColor = () => {
    switch (status) {
      case "listening":
        return "0 0 30px rgba(57, 255, 20, 0.8)";
      case "processing":
        return "0 0 30px rgba(0, 243, 255, 0.8)";
      case "alert":
        return "0 0 30px rgba(255, 0, 85, 0.8)";
      default:
        return "0 0 15px rgba(57, 255, 20, 0.3)";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.button
        onPointerDown={onPressStart}
        onPointerUp={onPressEnd}
        onPointerLeave={onPressEnd}
        animate={{
          scale:
            status === "listening"
              ? 1.1
              : status === "processing"
                ? [1, 1.05, 1]
                : 1,
          boxShadow: getShadowColor(),
        }}
        transition={{
          scale: {
            duration: status === "processing" ? 1.5 : 0.2,
            repeat: status === "processing" ? Infinity : 0,
          },
        }}
        className="relative w-16 h-16 rounded-full flex items-center justify-center bg-agri-800 border-2 border-agri-600 focus:outline-none z-50 touch-none"
      >
        {/* Pulsating background rings */}
        <motion.div
          animate={{
            scale: [1, 1.5, 2],
            opacity: [0.5, 0.2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 rounded-full border border-neon-green/50"
        />

        <motion.div
          animate={{ backgroundColor: getOrbColor() }}
          className="absolute inset-2 rounded-full opacity-20"
        />

        <Mic className="text-white z-10" size={24} />
      </motion.button>
      <p className="text-[10px] text-agri-300 mt-3 uppercase tracking-widest font-semibold">
        Tap to speak in Bangla
      </p>
    </div>
  );
}
