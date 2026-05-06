/* eslint-disable @next/next/no-img-element */
"use client";
import { ShieldAlert, AlertTriangle, CheckCircle, PhoneCall } from "lucide-react";
import { motion } from "framer-motion";
import { TTSButton } from "./TTSButton";

export interface VisionData {
  crop_type: string;
  disease_name: string;
  confidence: number; // 0 to 100
  thumbnail_url: string;
  severity: "low" | "medium" | "high";
}

export function VisionDiagnosis({ data }: { data: VisionData }) {
  const isHighConfidence = data.confidence >= 80;
  const isLowConfidence = data.confidence < 50;

  const colorClass = isHighConfidence ? "text-neon-green" : isLowConfidence ? "text-neon-red" : "text-neon-yellow";
  const bgClass = isHighConfidence ? "bg-neon-green/20" : isLowConfidence ? "bg-neon-red/20" : "bg-neon-yellow/20";
  const borderClass = isHighConfidence ? "border-neon-green" : isLowConfidence ? "border-neon-red" : "border-neon-yellow";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`w-full bg-agri-dark border-2 ${borderClass} rounded-2xl overflow-hidden shadow-lg mt-2 relative`}
    >
      <div className={`px-4 py-2 flex items-center justify-between border-b ${borderClass} ${bgClass}`}>
        <div className={`flex items-center gap-2 text-sm font-bold ${colorClass}`}>
          {isHighConfidence ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          <span>এআই স্ক্যানিং রিপোর্ট</span>
        </div>
        <TTSButton text={`${data.crop_type} গাছে ${data.disease_name} শনাক্ত হয়েছে। আত্মবিশ্বাস ${data.confidence} শতাংশ।`} />
      </div>

      <div className="p-4 flex gap-4">
        {/* Thumbnail with Fake Bounding Box */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-agri-600 bg-black">
          <img src={data.thumbnail_url || "/placeholder-leaf.jpg"} alt="Scanned crop" className="w-full h-full object-cover opacity-80" />
          <div className={`absolute top-2 left-2 right-2 bottom-2 border-2 ${borderClass} bg-transparent border-dashed animate-pulse`} />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-agri-300 text-xs mb-1">শনাক্তকৃত রোগ</p>
          <p className="text-lg font-bold text-white leading-tight">{data.disease_name}</p>
          <p className="text-xs text-agri-400 mt-1">ফসল: {data.crop_type}</p>
          
          {/* Confidence Meter */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-agri-400">নিশ্চয়তা (Confidence)</span>
              <span className={`font-bold ${colorClass}`}>{data.confidence}%</span>
            </div>
            <div className="h-1.5 w-full bg-agri-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${data.confidence}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${isHighConfidence ? "bg-neon-green" : isLowConfidence ? "bg-neon-red" : "bg-neon-yellow"}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-agri-800/50 border-t border-agri-700 flex justify-between items-center gap-2">
        <p className="text-xs text-agri-300 leading-tight flex-1">
          {isHighConfidence 
            ? "ফলাফল নিশ্চিত। নিচে দেওয়া পরামর্শ অনুসরণ করুন।" 
            : "ফলাফল নিশ্চিত নয়। দয়া করে বিশেষজ্ঞের পরামর্শ নিন।"}
        </p>
        <button 
          className="flex items-center gap-1.5 bg-agri-600 hover:bg-agri-500 text-white text-xs px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
          onClick={() => { if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]); }}
        >
          <PhoneCall size={14} />
          <span>বিশেষজ্ঞ</span>
        </button>
      </div>
    </motion.div>
  );
}
