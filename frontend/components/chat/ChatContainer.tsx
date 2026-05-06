"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Bot, Menu, Settings, Plus, Trash2, MessageSquare } from "lucide-react";
import { CameraOverlay } from "../scanner/CameraOverlay";
import { WeatherRiskBar, WeatherRiskData } from "../widgets/WeatherRiskBar";
import { MarketData } from "../widgets/MarketPriceWidget";
import { AgentMapData } from "../widgets/AgentMapWidget";
import { MarketTrendData } from "../widgets/MarketTrendWidget";
import { SoilRadarData } from "../widgets/SoilRadarWidget";
import { CropTimelineData } from "../widgets/CropTimelineWidget";
import { PestHeatmapData } from "../widgets/PestHeatmapWidget";
import { YieldPredictorData } from "../widgets/YieldPredictorWidget";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatSession {
  id: string;
  title: string;
}

const mockWeatherRisk: WeatherRiskData = {
  risk_level: "red",
  event_name: "ভারী বৃষ্টিপাত ও কালবৈশাখী",
  action_suggested: "ফসল দ্রুত ঘরে তুলুন অথবা পলিথিন দিয়ে ঢেকে দিন।",
  action_type: "cover",
  countdown_minutes: 135,
};

const mockMarketData: MarketData = {
  crop_name: "ধান (Rice)",
  local_price: 1150,
  local_market_name: "বগুড়া বাজার",
  dhaka_price: 1300,
  dhaka_market_name: "কাওরান বাজার",
  trend: "up",
  change_percent: 2.5,
};

const mockMarketMessage: Message = {
  id: "mock-market",
  role: "assistant",
  content: "আজকের বাজার দর অনুযায়ী আপনার ধানের আনুমানিক মূল্য:",
  agentUsed: "MARKET AGENT",
  widgetType: "market_price",
  widgetData: mockMarketData,
};

const mockDosageMessage: Message = {
  id: "mock-dosage",
  role: "assistant",
  content: "আপনার জমির জন্য সারের সঠিক পরিমাণ নিচে দেওয়া হলো:",
  agentUsed: "RULE ENGINE",
  widgetType: "dosage_card",
  widgetData: {
    ingredient: "ইউরিয়া (Urea)",
    amount: 20,
    unit_bigha: "কেজি",
    unit_acre: "কেজি",
    water_ratio: "প্রযোজ্য নয়",
    safety_flag: true,
    safety_flag: true,
  },
};

const mockFertilizerAgentData: AgentMapData = {
  topic: "fertilizer_agent",
  location: "Mohakhali Bazar, Dhaka",
  agents: [
    {
      id: "1",
      name: "Soil Testing Agent",
      distance: "1.2 km",
      phone: "017XXXXXXX",
      address: "Mohakhali Bazar",
      status: "open",
      description: "Soil testing agent",
      imageURL: "https://images.unsplash.com/photo-1628189874836-e0743f54d6fc?q=80&w=200",
      services: ["Soil Testing", "Fertilizer Recommendation", "Crop Advisory"],
      price_list: [
        { service: "Soil Testing", price: "100 Taka" },
        { service: "Fertilizer Recommendation", price: "50 Taka" },
        { service: "Crop Advisory", price: "200 Taka" }
      ],
      location: { address: "Mohakhali Bazar, Dhaka", latitude: "23.75211322452702", longitude: "90.42035710214257" }
    }
  ]
};

const mockVetenaryAgentData: AgentMapData = {
  topic: "vetenary_agent",
  location: "Mohakhali Bazar, Dhaka",
  agents: [
    {
      id: "1",
      name: "Vetinary Agent",
      distance: "1.2 km",
      phone: "017XXXXXXX",
      address: "Mohakhali Bazar",
      status: "open",
      description: "Vetinary agent",
      imageURL: "https://images.unsplash.com/photo-1596272875886-f6313ed6c99f?q=80&w=200",
      services: ["Vetinary Services", "Vaccination", "Deworming"],
      price_list: [
        { service: "Vetinary Services", price: "100 Taka" },
        { service: "Vaccination", price: "50 Taka" },
        { service: "Deworming", price: "200 Taka" }
      ],
      location: { address: "Mohakhali Bazar, Dhaka", latitude: "23.75211322452702", longitude: "90.42035710214257" }
    }
  ]
};

const mockRiceBuyerAgentData: AgentMapData = {
  topic: "rice_buyer_agent",
  location: "Mohakhali Bazar, Dhaka",
  agents: [
    {
      id: "1",
      name: "Rice Buyer Agent",
      distance: "1.2 km",
      phone: "017XXXXXXX",
      address: "Mohakhali Bazar",
      status: "open",
      description: "Rice Buyer Agent",
      imageURL: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200",
      services: ["Rice Evaluator", "Grain Pricing", "Bulk Purchasing"],
      price_list: [
        { service: "Premium Grade Rice", price: "100 Taka/maund" },
        { service: "Standard Grade Rice", price: "70 Taka/maund" },
        { service: "Assessment Fee", price: "50 Taka" }
      ],
      location: { address: "Mohakhali Bazar, Dhaka", latitude: "23.75211322452702", longitude: "90.42035710214257" }
    }
  ]
};

const mockMarketTrendData: MarketTrendData = {
  crop: "ধান (আমন)",
  currentPrice: 1250,
  trend: "up",
  history: [
    { date: "1 May", price: 1150 },
    { date: "2 May", price: 1180 },
    { date: "3 May", price: 1170 },
    { date: "4 May", price: 1200 },
    { date: "5 May", price: 1220 },
    { date: "6 May", price: 1210 },
    { date: "7 May", price: 1250 }
  ]
};

const mockSoilRadarData: SoilRadarData = {
  region: "বগুড়া",
  data: [
    { subject: "Nitrogen (N)", A: 45, fullMark: 100 },
    { subject: "Phosphorus (P)", A: 80, fullMark: 100 },
    { subject: "Potassium (K)", A: 65, fullMark: 100 },
    { subject: "Moisture", A: 30, fullMark: 100 },
    { subject: "pH Balance", A: 85, fullMark: 100 }
  ]
};

const mockCropTimelineData: CropTimelineData = {
  cropName: "বোরো ধান",
  stages: [
    { name: "বীজতলা তৈরি (Seedbed)", date: "১৫ ডিসেম্বর - ৩০ ডিসেম্বর", status: "completed" },
    { name: "চারা রোপণ (Transplanting)", date: "১৫ জানুয়ারি - ৩১ জানুয়ারি", status: "completed" },
    { name: "কুশি পর্যায় (Tillering)", date: "১৫ ফেব্রুয়ারি - ১৫ মার্চ", status: "current" },
    { name: "থোড় আসা (Booting)", date: "১ এপ্রিল - ১৫ এপ্রিল", status: "upcoming" },
    { name: "ফসল কাটা (Harvesting)", date: "১ মে - ১৫ মে", status: "upcoming" }
  ]
};

const mockPestHeatmapData: PestHeatmapData = {
  region: "রাজশাহী বিভাগ",
  alerts: [
    { zone: "বগুড়া সদর", threatLevel: "high", disease: "ব্লাস্ট রোগ (Blast Disease)" },
    { zone: "নওগাঁ", threatLevel: "medium", disease: "মাজরা পোকা (Stem Borer)" },
    { zone: "নাটোর", threatLevel: "low", disease: "পাতা মোড়ানো পোকা" }
  ]
};

const mockYieldPredictorData: YieldPredictorData = {
  crop: "ব্রি ধান-২৮",
  baseYieldPerBigha: 800,
  basePricePerKg: 30
};

const SESSION_TITLES: Record<string, { BN: string; EN: string }> = {
  "1": { BN: "সারের হিসাব", EN: "Fertilizer Calc" },
  "2": { BN: "বাজার দর", EN: "Market Price" },
};

export function ChatContainer() {
  const [lang, setLang] = useState<"BN" | "EN">("BN");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: "1", title: "সারের হিসাব" },
    { id: "2", title: "বাজার দর" },
  ]);
  const [activeSession, setActiveSession] = useState("1");

  const getWelcomeMessage = (language: "BN" | "EN"): Message => ({
    id: "welcome",
    role: "assistant",
    content:
      language === "BN"
        ? "সালাম লিয়ন ভাই! আমি **Agripulse AI**। আপনার ফসল, পোকামাকড়, আবহাওয়া বা পশু-পাখি সম্পর্কে যেকোনো প্রশ্ন করুন।"
        : "Hello Leon bhai! I am **Agripulse AI**. Ask me any question about your crops, insects, weather, or livestock.",
  });

  const [messages, setMessages] = useState<Message[]>([
    getWelcomeMessage("BN"),
    mockMarketMessage,
    mockDosageMessage,
  ]);
  const [input, setInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  const [agentStatus, setAgentStatus] = useState<
    "idle" | "listening" | "processing" | "alert"
  >("idle");
  const [showCameraOverlay, setShowCameraOverlay] = useState(false);
  const [scanResult, setScanResult] = useState<string | undefined>();

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageCapture = (file: File) => {
    setImagePreview(URL.createObjectURL(file));
    setShowCameraOverlay(true);
    setAgentStatus("processing");

    setTimeout(() => {
      setScanResult("Blast Disease Detected (৮০% নিশ্চিত)");
      setAgentStatus("alert");
    }, 2000);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const rawBase64 = base64String.split(",")[1] || base64String;
      setImageBase64(rawBase64);
    };
    reader.readAsDataURL(file);
  };

  const onImageDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    handleImageCapture(file);
  }, []);

  const handleOverlayClose = () => {
    setShowCameraOverlay(false);
    setScanResult(undefined);
    setAgentStatus("idle");

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: lang === "BN" ? "📷 ধানের পাতার ছবি স্ক্যান করা হয়েছে।" : "📷 Rice leaf image has been scanned.",
        imageUrl: imagePreview || undefined,
      },
    ]);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: lang === "BN" ? "ছবি বিশ্লেষণ সম্পন্ন হয়েছে।" : "Image analysis complete.",
          agentUsed: "VISION AGENT (LITE)",
          widgetType: "vision_diagnosis",
          widgetData: {
            crop_type: "ধান (Rice)",
            disease_name: "ব্লাস্ট রোগ (Blast Disease)",
            confidence: 85,
            thumbnail_url: imagePreview,
            severity: "high",
          },
        },
      ]);
    }, 1500);
  };

  const sendMessage = async () => {
    if (!input.trim() && !imageBase64) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setImagePreview(null);
    setImageBase64(null);
    setLoading(true);
    setAgentStatus("processing");

    const placeholderId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: "assistant", content: "..." },
    ]);

    try {
      const res = await fetch(`${API}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, session_id: sessionId }),
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: data.response, agentUsed: data.agent_used }
            : m,
        ),
      );
      setAgentStatus("idle");
    } catch (e) {
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== placeholderId));
        
        let responseMessage: Message | undefined;
        let agentUsed = "";
        let widgetType = "";
        let widgetData: any = null;
        let textResponse = "";

        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes("weather") || lowerInput.includes("আবহাওয়া")) {
          textResponse = lang === "BN" ? "আজকের আবহাওয়া: ভারী বৃষ্টিপাতের সম্ভাবনা রয়েছে। কালবৈশাখীর সতর্কতা জারি করা হয়েছে।" : "Today's weather: Heavy rainfall expected. A storm alert has been issued.";
          agentUsed = "WEATHER AGENT";
        } else if (lowerInput.includes("vet") || lowerInput.includes("animal") || lowerInput.includes("পশু") || lowerInput.includes("প্রাণী")) {
          agentUsed = "VETENARY AGENT";
          widgetData = mockVetenaryAgentData;
          widgetType = "agent_map";
          textResponse = lang === "BN" ? "আপনার আশেপাশের ভেটেরিনারি এজেন্টদের তালিকা:" : "List of nearby veterinary agents:";
        } else if (lowerInput.includes("rice buyer") || lowerInput.includes("buyer") || lowerInput.includes("ধান")) {
          agentUsed = "BUYER AGENT";
          widgetData = mockRiceBuyerAgentData;
          widgetType = "agent_map";
          textResponse = lang === "BN" ? "আপনার আশেপাশের ধান ক্রেতা এজেন্টদের তালিকা:" : "List of nearby rice buyer agents:";
        } else if (lowerInput.includes("agent") || lowerInput.includes("এজেন্ট") || lowerInput.includes("fertilizer") || lowerInput.includes("সার")) {
          agentUsed = "FERTILIZER AGENT";
          widgetData = mockFertilizerAgentData;
          widgetType = "agent_map";
          textResponse = lang === "BN" ? "আপনার আশেপাশের সার এজেন্টদের তালিকা:" : "List of nearby fertilizer agents:";
        } else if (lowerInput.includes("trend") || lowerInput.includes("market") || lowerInput.includes("দাম") || lowerInput.includes("বাজার")) {
          agentUsed = "MARKET AGENT";
          widgetData = mockMarketTrendData;
          widgetType = "market_trend";
          textResponse = lang === "BN" ? "গত ৭ দিনের বাজার দর বিশ্লেষণ নিচে দেওয়া হলো:" : "Here is the market trend analysis for the last 7 days:";
        } else if (lowerInput.includes("soil") || lowerInput.includes("মাটি")) {
          agentUsed = "SOIL AGENT";
          widgetData = mockSoilRadarData;
          widgetType = "soil_radar";
          textResponse = lang === "BN" ? "আপনার এলাকার মাটির স্বাস্থ্য পরীক্ষা রিপোর্ট:" : "Soil health report for your area:";
        } else if (lowerInput.includes("timeline") || lowerInput.includes("calendar") || lowerInput.includes("সময়সূচী") || lowerInput.includes("ফসল")) {
          agentUsed = "CROP EXPERT AGENT";
          widgetData = mockCropTimelineData;
          widgetType = "crop_timeline";
          textResponse = lang === "BN" ? "ফসলের বৃদ্ধি ও সময়সূচী নিচে দেওয়া হলো:" : "Crop growth timeline is given below:";
        } else if (lowerInput.includes("pest") || lowerInput.includes("disease") || lowerInput.includes("পোকা") || lowerInput.includes("রোগ")) {
          agentUsed = "PEST CONTROL AGENT";
          widgetData = mockPestHeatmapData;
          widgetType = "pest_heatmap";
          textResponse = lang === "BN" ? "আপনার এলাকার পোকামাকড় ও রোগবালাই সতর্কতা ম্যাপ:" : "Pest and disease alert map for your area:";
        } else if (lowerInput.includes("yield") || lowerInput.includes("predict") || lowerInput.includes("ফলন") || lowerInput.includes("আয়")) {
          agentUsed = "YIELD PREDICTOR AGENT";
          widgetData = mockYieldPredictorData;
          widgetType = "yield_predictor";
          textResponse = lang === "BN" ? "আপনার জমির পরিমাণ অনুযায়ী সম্ভাব্য ফলন হিসাব করুন:" : "Calculate estimated yield based on your land size:";
        }

        if (widgetType && widgetData) {
          responseMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: textResponse,
            agentUsed: agentUsed,
            widgetType: widgetType as any,
            widgetData: widgetData,
          };
        } else if (textResponse) {
          responseMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: textResponse,
            agentUsed: agentUsed,
          };
        } else {
          responseMessage = { ...mockDosageMessage, id: crypto.randomUUID(), content: lang === "BN" ? mockDosageMessage.content : "Correct fertilizer amount for your land is given below:" };
        }

        if (responseMessage) {
          setMessages((prev) => [...prev, responseMessage as Message]);
        }
        setAgentStatus("idle");
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title:
        input.slice(0, 30) || (lang === "BN" ? "নতুন কথোয়াল" : "New Chat"),
    };
    setSessions([newSession, ...sessions]);
    setActiveSession(newSession.id);
    setMessages([getWelcomeMessage(lang)]);
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    if (activeSession === id && sessions.length > 1) {
      setActiveSession(sessions.find((s) => s.id !== id)?.id || "");
    }
  };

  return (
    <>
      <div className="flex h-screen w-full bg-agri-dark">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-0"} flex-shrink-0 bg-agri-900 border-r border-agri-800 overflow-hidden transition-all duration-300`}
        >
          <div className="w-64 h-full flex flex-col">
            {/* New Chat Button */}
            <div className="p-3">
              <button
                onClick={newChat}
                className="w-full flex items-center gap-2 px-4 py-3 bg-agri-800 hover:bg-agri-700 rounded-lg border border-agri-600 transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                {lang === "BN" ? "নতুন কথোয়াল" : "New Chat"}
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeSession === session.id
                      ? "bg-agri-800 text-neon-green"
                      : "text-agri-300 hover:bg-agri-800/50 hover:text-white"
                  }`}
                  onClick={() => setActiveSession(session.id)}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">
                    {SESSION_TITLES[session.id] ? SESSION_TITLES[session.id][lang] : session.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-agri-700 rounded transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Settings */}
            <div className="p-3 border-t border-agri-800">
              <button className="flex items-center gap-2 w-full px-3 py-2 text-agri-300 hover:text-white hover:bg-agri-800 rounded-lg transition-colors text-sm">
                <Settings size={16} />
                {lang === "BN" ? "সেটিংস" : "Settings"}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 border-b border-agri-800 flex items-center justify-between px-4 bg-agri-dark/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-agri-800 rounded-lg transition-colors"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-agri-800 flex items-center justify-center text-neon-green">
                  <Bot size={18} />
                </div>
                <h1 className="text-lg font-semibold">Agripulse AI</h1>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newLang = lang === "BN" ? "EN" : "BN";
                  setLang(newLang);
                  setMessages((prev) => prev.map((m) => {
                    if (m.id === "welcome") {
                      return getWelcomeMessage(newLang);
                    }
                    if (m.id === "mock-market") {
                      return { ...m, content: newLang === "BN" ? mockMarketMessage.content : "Estimated price of your rice based on today's market:" };
                    }
                    if (m.widgetType === "dosage_card") {
                      return { ...m, content: newLang === "BN" ? mockDosageMessage.content : "Correct fertilizer amount for your land is given below:" };
                    }
                    if (m.widgetType === "vision_diagnosis") {
                      return { ...m, content: newLang === "BN" ? "ছবি বিশ্লেষণ সম্পন্ন হয়েছে।" : "Image analysis complete." };
                    }
                    if (m.widgetType === "agent_map") {
                      return { ...m, content: newLang === "BN" ? "আপনার আশেপাশের এজেন্টদের তালিকা নিচে দেওয়া হলো:" : "Here is the list of nearby agents:" };
                    }
                    return m;
                  }));
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-agri-800 hover:bg-agri-700 rounded-lg transition-colors text-sm font-medium border border-agri-700"
              >
                {lang === "BN" ? "EN" : "বাংলা"}
              </button>
            </div>
          </header>

          {/* Weather Alert */}
          <WeatherRiskBar data={mockWeatherRisk} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} lang={lang} />
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 px-4 py-3 bg-agri-800/60 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-neon-blue animate-bounce"></span>
                    <span
                      className="w-2 h-2 rounded-full bg-neon-blue animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full bg-neon-blue animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0 px-4 pb-4">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                input={input}
                setInput={setInput}
                loading={loading}
                onSend={sendMessage}
                imagePreview={showCameraOverlay ? null : imagePreview}
                setImagePreview={setImagePreview}
                onImageDrop={onImageDrop}
                clearImage={() => {
                  setImagePreview(null);
                  setImageBase64(null);
                }}
                agentStatus={agentStatus}
                setAgentStatus={setAgentStatus}
                lang={lang}
              />
            </div>
          </div>
        </main>
      </div>

      {showCameraOverlay && imagePreview && (
        <CameraOverlay
          imagePreview={imagePreview}
          onClose={handleOverlayClose}
          scanResult={scanResult}
        />
      )}
    </>
  );
}
