/* eslint-disable @next/next/no-img-element */
"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface CameraOverlayProps {
  imagePreview: string;
  onClose: () => void;
  scanResult?: string;
}

export function CameraOverlay({
  imagePreview,
  onClose,
  scanResult,
}: CameraOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="px-3 py-1 bg-neon-green/20 border border-neon-green/50 rounded-full text-neon-green text-xs font-mono font-bold tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
          SCANNING
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-black/50 rounded-full text-white hover:bg-white/20 backdrop-blur-md"
        >
          <X size={20} />
        </button>
      </div>

      {/* Camera Image */}
      <div className="relative flex-1 w-full h-full">
        <img
          src={imagePreview}
          alt="Camera view"
          className="w-full h-full object-cover"
        />

        {/* Cyberpunk Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none mix-blend-screen" />

        {/* Scanning Line Animation */}
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-1 bg-neon-green shadow-[0_0_20px_#39ff14] z-10 opacity-70"
        />

        {/* AR Tag */}
        {scanResult && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md border border-neon-red px-4 py-2 rounded-xl shadow-neon-red z-20"
          >
            <p className="text-white text-sm font-bold flex items-center gap-2">
              ⚠️ {scanResult}
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center z-20">
        <p className="text-agri-300 text-xs font-mono">
          LITE-AGENT VISION V2.0 ACTIVE
        </p>
      </div>
    </div>
  );
}
