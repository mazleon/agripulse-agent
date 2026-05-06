"use client";
import { Target } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { TTSButton } from "./TTSButton";

export interface SoilRadarData {
  region: string;
  data: { subject: string; A: number; fullMark: number }[];
}

export function SoilRadarWidget({ data, lang = "BN" }: { data: SoilRadarData; lang?: "BN" | "EN" }) {
  const t = {
    title: lang === "BN" ? "মাটির স্বাস্থ্য (রাডার)" : "Soil Health Radar",
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-agri-dark border border-agri-600 rounded-2xl overflow-hidden shadow-lg mt-2"
    >
      <div className="bg-agri-800 px-4 py-2 flex items-center justify-between border-b border-agri-600">
        <div className="flex items-center gap-2 text-agri-100 text-sm font-semibold">
          <Target size={16} className="text-earth-300" />
          <span>{t.title} - {data.region}</span>
        </div>
        <TTSButton text={lang === "BN" ? `${data.region} এর মাটির স্বাস্থ্য রিপোর্ট দেখানো হচ্ছে।` : `Showing soil health report for ${data.region}.`} />
      </div>

      <div className="p-4 h-64 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.data}>
            <PolarGrid stroke="#2d3748" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a0aec0', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4a5568', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#39ff14' }}
            />
            <Radar name="Soil Quality" dataKey="A" stroke="#39ff14" fill="#39ff14" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
