"use client";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { TTSButton } from "./TTSButton";

export interface MarketTrendData {
  crop: string;
  currentPrice: number;
  trend: "up" | "down";
  history: { date: string; price: number }[];
}

export function MarketTrendWidget({ data, lang = "BN" }: { data: MarketTrendData; lang?: "BN" | "EN" }) {
  const t = {
    title: lang === "BN" ? "বাজার দর বিশ্লেষণ" : "Market Trend Analysis",
    current: lang === "BN" ? "বর্তমান দাম" : "Current Price",
    unit: lang === "BN" ? "৳/মণ" : "৳/maund",
  };

  const isUp = data.trend === "up";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-agri-dark border border-agri-600 rounded-2xl overflow-hidden shadow-lg mt-2"
    >
      <div className="bg-agri-800 px-4 py-2 flex items-center justify-between border-b border-agri-600">
        <div className="flex items-center gap-2 text-agri-100 text-sm font-semibold">
          <DollarSign size={16} className={isUp ? "text-neon-green" : "text-neon-red"} />
          <span>{t.title} - {data.crop}</span>
        </div>
        <TTSButton text={lang === "BN" ? `${data.crop} এর বর্তমান দাম ${data.currentPrice} টাকা প্রতি মণ।` : `Current price of ${data.crop} is ${data.currentPrice} Taka per maund.`} />
      </div>

      <div className="p-4">
        <div className="flex items-end gap-3 mb-6">
          <div className="text-3xl font-bold text-white flex items-baseline gap-1">
            {data.currentPrice} <span className="text-sm font-normal text-agri-400">{t.unit}</span>
          </div>
          <div className={`flex items-center text-sm font-medium ${isUp ? 'text-neon-green' : 'text-neon-red'}`}>
            {isUp ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            <span>{isUp ? "+2.5%" : "-1.2%"}</span>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? "#39ff14" : "#ff3333"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isUp ? "#39ff14" : "#ff3333"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
              <XAxis dataKey="date" stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#718096" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="price" stroke={isUp ? "#39ff14" : "#ff3333"} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
