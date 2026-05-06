"use client";
import { useState } from "react";
import { Calculator, Wheat, CircleDollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { TTSButton } from "./TTSButton";

export interface YieldPredictorData {
  crop: string;
  baseYieldPerBigha: number; // in kg
  basePricePerKg: number; // in Taka
}

export function YieldPredictorWidget({ data, lang = "BN" }: { data: YieldPredictorData; lang?: "BN" | "EN" }) {
  const [landSize, setLandSize] = useState(1); // bigha
  const [health, setHealth] = useState(80); // percentage

  const t = {
    title: lang === "BN" ? "স্মার্ট ফলন পূর্বাভাস" : "Smart Yield Predictor",
    landSize: lang === "BN" ? "জমির পরিমাণ (বিঘা)" : "Land Size (Bigha)",
    health: lang === "BN" ? "ফসলের স্বাস্থ্য" : "Crop Health",
    estYield: lang === "BN" ? "আনুমানিক ফলন" : "Est. Yield",
    estRevenue: lang === "BN" ? "আনুমানিক আয়" : "Est. Revenue",
    kg: lang === "BN" ? "কেজি" : "kg",
    taka: lang === "BN" ? "টাকা" : "Taka",
  };

  const predictedYield = Math.round(data.baseYieldPerBigha * landSize * (health / 100));
  const predictedRevenue = predictedYield * data.basePricePerKg;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-agri-dark border border-agri-600 rounded-2xl overflow-hidden shadow-lg mt-2"
    >
      <div className="bg-agri-800 px-4 py-2 flex items-center justify-between border-b border-agri-600">
        <div className="flex items-center gap-2 text-agri-100 text-sm font-semibold">
          <Calculator size={16} className="text-neon-green" />
          <span>{t.title} - {data.crop}</span>
        </div>
        <TTSButton text={lang === "BN" ? `${landSize} বিঘা জমির জন্য আনুমানিক ফলন হিসাব করা হচ্ছে।` : `Calculating estimated yield for ${landSize} bighas.`} />
      </div>

      <div className="p-4 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-agri-300">{t.landSize}</span>
            <span className="text-white font-bold">{landSize}</span>
          </div>
          <input 
            type="range" 
            min="1" max="20" step="1" 
            value={landSize} 
            onChange={(e) => setLandSize(Number(e.target.value))}
            className="w-full accent-neon-green"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-agri-300">{t.health}</span>
            <span className="text-white font-bold">{health}%</span>
          </div>
          <input 
            type="range" 
            min="30" max="100" step="5" 
            value={health} 
            onChange={(e) => setHealth(Number(e.target.value))}
            className="w-full accent-neon-blue"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-agri-800/80 p-3 rounded-xl border border-agri-700 flex flex-col items-center justify-center text-center">
            <Wheat size={20} className="text-earth-300 mb-1" />
            <span className="text-xs text-agri-400">{t.estYield}</span>
            <span className="text-lg font-bold text-white">{predictedYield} <span className="text-xs font-normal text-agri-500">{t.kg}</span></span>
          </div>
          <div className="bg-agri-800/80 p-3 rounded-xl border border-agri-700 flex flex-col items-center justify-center text-center">
            <CircleDollarSign size={20} className="text-neon-green mb-1" />
            <span className="text-xs text-agri-400">{t.estRevenue}</span>
            <span className="text-lg font-bold text-neon-green">{predictedRevenue.toLocaleString()} <span className="text-xs font-normal text-agri-500">{t.taka}</span></span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
