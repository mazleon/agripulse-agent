"use client";
import { Calendar, CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { TTSButton } from "./TTSButton";

export interface CropTimelineData {
  cropName: string;
  stages: { name: string; date: string; status: "completed" | "current" | "upcoming" }[];
}

export function CropTimelineWidget({ data, lang = "BN" }: { data: CropTimelineData; lang?: "BN" | "EN" }) {
  const t = {
    title: lang === "BN" ? "ফসল বৃদ্ধির সময়সূচী" : "Crop Growth Timeline",
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-agri-dark border border-agri-600 rounded-2xl overflow-hidden shadow-lg mt-2"
    >
      <div className="bg-agri-800 px-4 py-2 flex items-center justify-between border-b border-agri-600">
        <div className="flex items-center gap-2 text-agri-100 text-sm font-semibold">
          <Calendar size={16} className="text-neon-green" />
          <span>{t.title} - {data.cropName}</span>
        </div>
        <TTSButton text={lang === "BN" ? `${data.cropName} এর বৃদ্ধির সময়সূচী` : `Growth timeline for ${data.cropName}.`} />
      </div>

      <div className="p-5">
        <div className="relative border-l-2 border-agri-700 ml-3 space-y-6">
          {data.stages.map((stage, idx) => {
            const isCompleted = stage.status === "completed";
            const isCurrent = stage.status === "current";
            
            return (
              <div key={idx} className="relative pl-6">
                <div className="absolute -left-[11px] bg-agri-dark rounded-full">
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="text-neon-green bg-agri-dark" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full border-2 border-neon-blue flex items-center justify-center bg-agri-dark">
                      <div className="w-2 h-2 rounded-full bg-neon-blue animate-ping" />
                    </div>
                  ) : (
                    <Circle size={20} className="text-agri-600 bg-agri-dark" />
                  )}
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${isCurrent ? "text-neon-blue" : isCompleted ? "text-white" : "text-agri-500"}`}>
                    {stage.name}
                  </h4>
                  <p className="text-xs text-agri-400 mt-0.5">{stage.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
