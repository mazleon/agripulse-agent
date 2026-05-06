"use client";
import { Map, MapPin, Phone, Store, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { TTSButton } from "./TTSButton";

export interface AgentData {
  id: string;
  name: string;
  distance: string;
  phone: string;
  address: string;
  status: "open" | "closed";
  description?: string;
  imageURL?: string;
  services?: string[];
  price_list?: { service: string; price: string }[];
  location?: {
    address: string;
    latitude: string;
    longitude: string;
  };
}

export interface AgentMapData {
  topic: string;
  location: string;
  agents: AgentData[];
}

export function AgentMapWidget({ data, lang = "BN" }: { data: AgentMapData; lang?: "BN" | "EN" }) {
  const t = {
    title: lang === "BN" ? "নিকটস্থ এজেন্ট" : "Nearby Agents",
    open: lang === "BN" ? "খোলা" : "Open",
    closed: lang === "BN" ? "বন্ধ" : "Closed",
    call: lang === "BN" ? "কল করুন" : "Call",
    nav: lang === "BN" ? "ডিরেকশন" : "Directions",
    services: lang === "BN" ? "সেবা সমূহ:" : "Services:",
  };

  const getTopicIcon = (topic: string) => {
    switch(topic) {
      case "vetenary_agent":
        return <Store size={16} className="text-neon-blue" />;
      case "rice_buyer_agent":
        return <Store size={16} className="text-earth-300" />;
      default:
        return <Store size={16} className="text-neon-green" />;
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-agri-dark border border-agri-600 rounded-2xl overflow-hidden shadow-lg mt-2"
    >
      <div className="bg-agri-800 px-4 py-2 flex items-center justify-between border-b border-agri-600">
        <div className="flex items-center gap-2 text-agri-100 text-sm font-semibold">
          <Map size={16} className="text-neon-blue" />
          <span>{t.title} - {data.location}</span>
        </div>
        <TTSButton text={lang === "BN" ? `${data.location} এলাকায় ${data.agents.length} জন এজেন্ট পাওয়া গেছে।` : `Found ${data.agents.length} agents near ${data.location}.`} />
      </div>

      <div className="p-4">
        {/* Mock Map Area */}
        <div className="w-full h-32 bg-agri-900 rounded-xl mb-4 relative overflow-hidden border border-agri-800 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0V0zm10 10h10v10H10V10zM0 10h10v10H0V10zM10 0h10v10H10V0z\' fill=\'%234ade80\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")', backgroundSize: '20px 20px' }}></div>
          <div className="z-10 flex flex-col items-center text-agri-500">
            <MapPin size={32} className="text-neon-green mb-1 animate-bounce" />
            <span className="text-xs font-semibold">{data.location}</span>
          </div>
          {/* Mock Markers */}
          <div className="absolute top-4 left-1/4">
            <MapPin size={20} className="text-neon-blue" />
          </div>
          <div className="absolute bottom-6 right-1/3">
            <MapPin size={20} className="text-neon-blue" />
          </div>
        </div>

        {/* Agents List */}
        <div className="space-y-3">
          {data.agents.map((agent) => (
            <div key={agent.id} className="bg-agri-800/60 rounded-xl p-3 border border-agri-700 hover:border-neon-green/50 transition-colors">
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="flex items-start gap-3">
                  {agent.imageURL ? (
                    <img src={agent.imageURL} alt={agent.name} className="w-12 h-12 object-cover rounded-lg border border-agri-700" />
                  ) : (
                    <div className="p-3 bg-agri-900 rounded-lg shrink-0">
                      {getTopicIcon(data.topic)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-semibold text-sm">{agent.name}</h4>
                    <p className="text-agri-400 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {agent.distance} • {agent.address}
                    </p>
                    {agent.description && (
                      <p className="text-agri-300 text-xs mt-1 italic">{agent.description}</p>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${agent.status === 'open' ? 'bg-neon-green/20 text-neon-green' : 'bg-neon-red/20 text-neon-red'}`}>
                  {agent.status === 'open' ? t.open : t.closed}
                </span>
              </div>
              
              {agent.services && agent.services.length > 0 && (
                <div className="mt-2 mb-2 flex flex-wrap gap-1">
                  {agent.services.map((service, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-agri-700 text-agri-200 rounded">
                      {service}
                    </span>
                  ))}
                </div>
              )}

              {agent.price_list && agent.price_list.length > 0 && (
                <div className="mt-2 space-y-1 bg-agri-900/50 p-2 rounded-lg">
                  {agent.price_list.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-agri-300">{item.service}</span>
                      <span className="text-white font-medium">{item.price}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2 mt-3">
                <a href={`tel:${agent.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-agri-700 hover:bg-agri-600 rounded-lg text-xs text-white transition-colors">
                  <Phone size={12} className="text-neon-blue" />
                  {t.call}
                </a>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-agri-700 hover:bg-agri-600 rounded-lg text-xs text-white transition-colors">
                  <Navigation size={12} className="text-earth-300" />
                  {t.nav}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
