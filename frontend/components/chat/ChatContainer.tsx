"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Bot, Menu, Settings, Plus, Trash2, MessageSquare } from "lucide-react";
import { CameraOverlay } from "../scanner/CameraOverlay";
import { WeatherRiskBar, WeatherRiskData } from "../widgets/WeatherRiskBar";

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
  }
};

export function ChatContainer() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: "1", title: "সারের হিসাব" },
    { id: "2", title: "বাজার দর" },
  ]);
  const [activeSession, setActiveSession] = useState("1");
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "সালাম লিয়ন ভাই! আমি **কৃষি-শক্তি**। আপনার ফসল, পোকামাকড়, আবহাওয়া বা পশু-পাখি সম্পর্কে যেকোনো প্রশ্ন করুন।",
    },
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
    
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: "user",
      content: "📷 ধানের পাতার ছবি স্ক্যান করা হয়েছে।",
      imageUrl: imagePreview || undefined,
    }]);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "ছবি বিশ্লেষণ সম্পন্ন হয়েছে।",
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
        setMessages((prev) => prev.filter(m => m.id !== placeholderId));
        setMessages((prev) => [...prev, mockDosageMessage]);
        setAgentStatus("idle");
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: input.slice(0, 30) || "নতুন কথোয়াল",
    };
    setSessions([newSession, ...sessions]);
    setActiveSession(newSession.id);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: "সালাম লিয়ন ভাই! আমি **কৃষি-শক্তি**। আপনার ফসল, পোকামাকড়, আবহাওয়া বা পশু-পাখি সম্পর্কে যেকোনো প্রশ্ন করুন।",
    }]);
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    if (activeSession === id && sessions.length > 1) {
      setActiveSession(sessions.find(s => s.id !== id)?.id || "");
    }
  };

  return (
    <>
      <div className="flex h-screen w-full bg-agri-dark">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-agri-900 border-r border-agri-800 overflow-hidden transition-all duration-300`}>
          <div className="w-64 h-full flex flex-col">
            {/* New Chat Button */}
            <div className="p-3">
              <button
                onClick={newChat}
                className="w-full flex items-center gap-2 px-4 py-3 bg-agri-800 hover:bg-agri-700 rounded-lg border border-agri-600 transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                নতুন কথোয়াল
              </button>
            </div>
            
            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeSession === session.id 
                      ? 'bg-agri-800 text-neon-green' 
                      : 'text-agri-300 hover:bg-agri-800/50 hover:text-white'
                  }`}
                  onClick={() => setActiveSession(session.id)}
                >
                  <MessageSquare size={16} className="flex-shrink-0" />
                  <span className="flex-1 truncate text-sm">{session.title}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
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
                সেটিংস
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
                <h1 className="text-lg font-semibold">কৃষি-শক্তি</h1>
              </div>
            </div>
          </header>

          {/* Weather Alert */}
          <WeatherRiskBar data={mockWeatherRisk} />

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 px-4 py-3 bg-agri-800/60 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-neon-blue animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-neon-blue animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-2 h-2 rounded-full bg-neon-blue animate-bounce" style={{ animationDelay: '0.3s' }}></span>
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