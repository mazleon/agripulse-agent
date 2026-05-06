"use client";
import { Map, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { TTSButton } from "./TTSButton";

export interface PestHeatmapData {
  region: string;
  alerts: { zone: string; threatLevel: "high" | "medium" | "low"; disease: string }[];
}

export function PestHeatmapWidget({ data, lang = "BN" }: { data: PestHeatmapData; lang?: "BN" | "EN" }) {
  const t = {
    title: lang === "BN" ? "পোকামাকড় ও রোগবালাই সতর্কতা" : "Pest & Disease Alerts",
    high: lang === "BN" ? "উচ্চ ঝুঁকি" : "High Risk",
    medium: lang === "BN" ? "মাঝারি ঝুঁকি" : "Medium Risk",
    low: lang === "BN" ? "স্বল্প ঝুঁকি" : "Low Risk",
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case "high": return "bg-neon-red text-white";
      case "medium": return "bg-yellow-500 text-agri-dark";
      default: return "bg-neon-green text-agri-dark";
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-agri-dark border border-agri-600 rounded-2xl overflow-hidden shadow-lg mt-2"
    >
      <div className="bg-neon-red/20 px-4 py-2 flex items-center justify-between border-b border-neon-red/50">
        <div className="flex items-center gap-2 text-neon-red text-sm font-semibold">
          <AlertTriangle size={16} />
          <span>{t.title} - {data.region}</span>
        </div>
        <TTSButton text={lang === "BN" ? `${data.region} অঞ্চলে রোগবালাইয়ের সতর্কতা।` : `Disease alerts for ${data.region}.`} />
      </div>

      <div className="p-4">
        <div className="w-full h-32 bg-agri-900 rounded-xl mb-4 relative overflow-hidden border border-agri-800">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0V0zm10 10h10v10H10V10zM0 10h10v10H0V10zM10 0h10v10H10V0z\' fill=\'%23ef4444\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '20px 20px' }}></div>
          {data.alerts.map((alert, idx) => (
            <div key={idx} className="absolute" style={{ top: `${20 + idx * 25}%`, left: `${15 + idx * 30}%` }}>
              <div className={`w-4 h-4 rounded-full ${alert.threatLevel === 'high' ? 'bg-neon-red animate-ping' : 'bg-yellow-500'} opacity-75`}></div>
              <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full ${alert.threatLevel === 'high' ? 'bg-neon-red' : 'bg-yellow-500'} opacity-50`}></div>
            </div>
          ))}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-agri-400 bg-agri-dark/80 px-2 py-1 rounded">
            <Map size={10} /> Live Map
          </div>
        </div>

        <div className="space-y-2">
          {data.alerts.map((alert, idx) => (
            <div key={idx} className="flex items-center justify-between bg-agri-800 p-2 rounded-lg text-sm border border-agri-700">
              <div>
                <span className="text-white font-medium block">{alert.zone}</span>
                <span className="text-agri-400 text-xs">{alert.disease}</span>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded font-bold ${getThreatColor(alert.threatLevel)}`}>
                {t[alert.threatLevel]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
