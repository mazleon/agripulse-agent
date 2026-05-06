"use client";
import { Lock, Beaker, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";
import { TTSButton } from "./TTSButton";
import { useState } from "react";

export interface DosageData {
  ingredient: string;
  amount: number;
  unit_bigha: string;
  unit_acre: string;
  water_ratio: string;
  safety_flag: boolean;
}

export function DosageCard({ data }: { data: DosageData }) {
  const [unitMode, setUnitMode] = useState<"bigha" | "acre">("bigha");

  const displayAmount = unitMode === "bigha" ? data.amount : data.amount * 3; // Approx 3 bigha = 1 acre
  const displayUnit = unitMode === "bigha" ? data.unit_bigha : data.unit_acre;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-agri-dark border border-agri-600 rounded-2xl overflow-hidden shadow-lg mt-2"
    >
      <div className="bg-agri-800 px-4 py-2 flex items-center justify-between border-b border-agri-600">
        <div className="flex items-center gap-2 text-neon-green text-sm font-semibold">
          <Beaker size={16} />
          <span>সার ও ঔষধের মাত্রা</span>
        </div>
        <TTSButton
          text={`আপনার জন্য প্রস্তাবিত মাত্রা হলো ${displayAmount} ${displayUnit} প্রতি ${unitMode === "bigha" ? "বিঘা" : "একর"}`}
        />
      </div>

      <div className="p-4">
        {data.safety_flag && (
          <div className="flex items-center gap-2 mb-4 text-xs font-mono text-neon-red bg-neon-red/10 px-2 py-1 rounded-md border border-neon-red/30 w-fit">
            <Lock size={12} />
            <span>EXACT MEASURE - RULE ENGINE</span>
          </div>
        )}

        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-agri-300 text-xs uppercase mb-1">
              উপাদান (Ingredient)
            </p>
            <p className="text-xl font-bold text-white">{data.ingredient}</p>
          </div>
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-4xl font-bold text-neon-green">
                {displayAmount}
              </span>
              <span className="text-agri-300">{displayUnit}</span>
            </div>
            <p className="text-[10px] text-agri-400 mt-1">
              / প্রতি {unitMode === "bigha" ? "বিঘা" : "একর"}
            </p>
          </div>
        </div>

        {/* Unit Selector Toggle */}
        <div className="flex bg-agri-800 rounded-lg p-1 mb-4">
          <button
            onClick={() => {
              setUnitMode("bigha");
              if ("vibrate" in navigator) navigator.vibrate(20);
            }}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${unitMode === "bigha" ? "bg-agri-600 text-white shadow-sm" : "text-agri-400"}`}
          >
            বিঘা (Bigha)
          </button>
          <button
            onClick={() => {
              setUnitMode("acre");
              if ("vibrate" in navigator) navigator.vibrate(20);
            }}
            className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${unitMode === "acre" ? "bg-agri-600 text-white shadow-sm" : "text-agri-400"}`}
          >
            একর (Acre)
          </button>
        </div>

        {/* Mix Ratio */}
        <div className="flex items-center gap-3 bg-agri-800/50 p-3 rounded-xl border border-agri-700/50">
          <div className="bg-neon-blue/20 p-2 rounded-lg text-neon-blue">
            <FlaskConical size={20} />
          </div>
          <div>
            <p className="text-[10px] text-agri-400 uppercase">
              পানির অনুপাত (Mix Ratio)
            </p>
            <p className="text-sm font-medium text-white">{data.water_ratio}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
