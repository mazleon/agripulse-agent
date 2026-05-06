"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Bot } from "lucide-react";
import { IntelligenceCards } from "../feed/IntelligenceCards";
import { CameraOverlay } from "../scanner/CameraOverlay";
import { WeatherRiskBar, WeatherRiskData } from "../widgets/WeatherRiskBar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Mock Data for UI demonstration
const mockWeatherRisk: WeatherRiskData = {
  risk_level: "red",
  event_name: "ভারী বৃষ্টিপাত ও কালবৈশাখী",
  action_suggested: "ফসল দ্রুত ঘরে তুলুন অথবা পলিথিন দিয়ে ঢেকে দিন।",
  action_type: "cover",
  countdown_minutes: 135, // 2h 15m
};

const mockDosageMessage: Message = {
  id: "mock-dosage",
  role: "assistant",
  content: "আপনার জমির জন্য সারের সঠিক পরিমাণ নিচে দেওয়া হলো:",
  agentUsed: "RULE ENGINE",
  widgetType: "dosage_card",
  widgetData: {
    ingredient: "ইউরিয়া (Urea)",
    amount: 20,
    unit_bigha: "কেজি",
    unit_acre: "কেজি",
    water_ratio: "প্রযোজ্য নয়",
    safety_flag: true,
  }
};

const mockMarketMessage: Message = {
  id: "mock-market",
  role: "assistant",
  content: "আজকের ধানের বাজার দরের হালনাগাদ তথ্য:",
  agentUsed: "MARKET AGENT",
  widgetType: "market_price",
  widgetData: {
    crop_name: "ইরি ধান (Paddy)",
    local_price: 1150,
    local_market_name: "বগুড়া মহাস্থানগড় হাট",
    dhaka_price: 1280,
    dhaka_market_name: "ঢাকা কারওয়ান বাজার",
    trend: "up",
    change_percent: 2.5,
  }
};

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "সালাম লিয়ন ভাই! আমি **কৃষি-শক্তি**। আপনার ফসল, পোকামাকড়, আবহাওয়া বা পশু-পাখি সম্পর্কে যেকোনো প্রশ্ন করুন।",
    },
    mockMarketMessage,
  ]);
  const [input, setInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  
  const [agentStatus, setAgentStatus] = useState<"idle" | "listening" | "processing" | "alert">("idle");
  const [showCameraOverlay, setShowCameraOverlay] = useState(false);
  const [scanResult, setScanResult] = useState<string | undefined>();
  
  const bottomRef = useRef<HTMLDivElement>(null);

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
      const rawBase64 = base64String.split(',')[1] || base64String;
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
    
    // Auto insert Vision Diagnosis mock
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: "user",
      content: "📷 ধানের পাতার ছবি স্ক্যান করা হয়েছে।",
      imageUrl: imagePreview || undefined,
    }]);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "ছবি বিশ্লেষণ সম্পন্ন হয়েছে।",
        agentUsed: "VISION AGENT (LITE)",
        widgetType: "vision_diagnosis",
        widgetData: {
          crop_type: "ধান (Rice)",
          disease_name: "ব্লাস্ট রোগ (Blast Disease)",
          confidence: 85,
          thumbnail_url: imagePreview,
          severity: "high"
        }
      }]);
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
            : m
        )
      );
      setAgentStatus("idle");
    } catch (e) {
      setTimeout(() => {
        // Remove placeholder and push mock dosage
        setMessages((prev) => prev.filter(m => m.id !== placeholderId));
        setMessages((prev) => [...prev, mockDosageMessage]);
        setAgentStatus("idle");
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-[90vh] md:h-full w-full max-w-2xl mx-auto bg-agri-dark overflow-hidden shadow-2xl relative">
        <WeatherRiskBar data={mockWeatherRisk} />

        <div className="bg-agri-dark/90 backdrop-blur-xl border-b border-agri-800 p-4 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-agri-800 border border-neon-green/50 flex items-center justify-center text-neon-green shadow-neon-green">
                <Bot size={22} />
              </div>
              {agentStatus === "processing" && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-blue"></span>
                </span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">কৃষি-শক্তি <span className="text-neon-green text-xs font-mono ml-1">v2.0</span></h2>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-earth-500 border border-earth-300"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide relative z-10">
          {messages.length <= 4 && <IntelligenceCards />}
          
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {loading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="flex gap-2 bg-agri-800/60 px-4 py-3 rounded-2xl rounded-tl-sm border border-neon-blue/30">
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-10" />
        </div>

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
        />
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
