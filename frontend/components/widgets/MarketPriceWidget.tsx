"use client";
import { TrendingUp, TrendingDown, MapPin, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { TTSButton } from "./TTSButton";
import { useState } from "react";

export interface MarketData {
  crop_name: string;
  local_price: number;
  local_market_name: string;
  dhaka_price: number;
  dhaka_market_name: string;
  trend: "up" | "down" | "stable";
  change_percent: number;
}

export function MarketPriceWidget({ data }: { data: MarketData }) {
  const [quantity, setQuantity] = useState(50);

  const isUp = data.trend === "up";
  const trendColor = isUp ? "text-neon-green" : data.trend === "down" ? "text-neon-red" : "text-neon-blue";
  
  const estimatedProfit = quantity * data.local_price;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-agri-dark border border-agri-600 rounded-2xl overflow-hidden shadow-lg mt-2"
    >
      <div className="bg-agri-800 px-4 py-2 flex items-center justify-between border-b border-agri-600">
        <div className="flex items-center gap-2 text-agri-100 text-sm font-semibold">
          <TrendingUp size={16} className={trendColor} />
          <span>বাজার দর विश्लेषण</span>
        </div>
        <TTSButton text={`${data.local_market_name} বাজারে ${data.crop_name} এর দাম প্রতি মণ ${data.local_price} টাকা।`} />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-4 text-center">{data.crop_name}</h3>
        
        {/* Price Comparison */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-agri-800/80 rounded-xl p-3 border border-neon-green/30 relative">
            <div className="absolute top-0 right-0 p-1.5 opacity-80">
              <MapPin size={12} className="text-neon-green" />
            </div>
            <p className="text-[10px] text-agri-300 uppercase truncate pr-4">{data.local_market_name}</p>
            <p className="text-2xl font-bold text-white">৳{data.local_price}</p>
            <div className={`flex items-center gap-1 text-xs mt-1 ${trendColor}`}>
              {isUp ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
              <span>{data.change_percent}%</span>
            </div>
          </div>
          
          <div className="bg-agri-800/40 rounded-xl p-3 border border-agri-700 relative">
            <div className="absolute top-0 right-0 p-1.5 opacity-50">
              <MapPin size={12} className="text-agri-400" />
            </div>
            <p className="text-[10px] text-agri-400 uppercase truncate pr-4">{data.dhaka_market_name}</p>
            <p className="text-xl font-semibold text-agri-200 mt-1">৳{data.dhaka_price}</p>
            <p className="text-[10px] text-agri-500 mt-1">রাজধানীর দর</p>
          </div>
        </div>

        {/* Profit Calculator */}
        <div className="bg-earth-dark/40 rounded-xl p-3 border border-earth-800">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-earth-300 text-xs">
              <Calculator size={12} />
              <span>আয় হিসাবকারী</span>
            </div>
            <span className="text-xs text-white font-mono">{quantity} মণ</span>
          </div>
          <input 
            type="range" 
            min="10" max="200" step="10" 
            value={quantity}
            onChange={(e) => {
              setQuantity(parseInt(e.target.value));
              if ("vibrate" in navigator) navigator.vibrate(10);
            }}
            className="w-full accent-earth-500 h-1 bg-earth-800 rounded-lg appearance-none cursor-pointer mb-3"
          />
          <div className="flex justify-between items-end">
            <span className="text-[10px] text-earth-500">সম্ভাব্য মোট মূল্য:</span>
            <span className="text-lg font-bold text-earth-300">৳{estimatedProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
