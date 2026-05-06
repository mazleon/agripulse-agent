"use client";
import { CloudRain, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const LineChart = dynamic(() => import("recharts").then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((mod) => mod.Line), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });

const paddyData = [
  { day: "1", price: 60 },
  { day: "2", price: 61 },
  { day: "3", price: 60 },
  { day: "4", price: 63 },
  { day: "5", price: 65 }, // ৳৬৫ (+২)
];

export function IntelligenceCards() {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-4 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <TrendingUp className="text-neon-green" size={40} />
        </div>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <div className="w-6 h-6 rounded-full bg-agri-600/50 flex items-center justify-center">
            <span className="text-xs">🌾</span>
          </div>
          <h3 className="text-sm font-semibold text-agri-100">বাজার দর</h3>
        </div>
        <div className="relative z-10">
          <p className="text-2xl font-bold text-white mb-1">৳৬৫ <span className="text-sm text-neon-green font-normal tracking-wider">+২</span></p>
          <p className="text-[10px] text-agri-300">চাল (ধান) • নিকটতম হাট</p>
        </div>
        <div className="h-10 mt-2 w-full relative z-10 opacity-70">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={paddyData}>
              <Line type="monotone" dataKey="price" stroke="#39ff14" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card glass-neon-border rounded-2xl p-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3 opacity-30">
          <CloudRain className="text-neon-blue" size={40} />
        </div>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center">
            <span className="text-xs">🌦</span>
          </div>
          <h3 className="text-sm font-semibold text-agri-100">আবহাওয়া</h3>
        </div>
        <div className="relative z-10">
          <p className="text-2xl font-bold text-white mb-1">বৃষ্টি <span className="text-sm text-neon-blue font-normal">২:০০ PM</span></p>
          <p className="text-[10px] text-agri-300">আজ বিকেলে ভারী বৃষ্টিপাত</p>
        </div>
        
        <button className="mt-3 w-full bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 text-neon-blue text-xs py-1.5 rounded-lg transition-colors font-medium">
          ফসল নিরাপদে রাখুন?
        </button>
      </motion.div>
    </div>
  );
}