"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "./types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Bot } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "আস্সালামু আলাইকুম! আমি **AgriPulse**। আপনার ফসল, পোকামাকড়, আবহাওয়া বা পশু-পাখি সম্পর্কে যেকোনো প্রশ্ন করুন। ছবিও পাঠাতে পারেন।",
    },
  ]);
  const [input, setInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const onImageDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    
    // Create local preview immediately
    setImagePreview(URL.createObjectURL(file));
    
    // Try to upload to get base64
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/api/v1/chat/upload-image`, { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.image_base64) setImageBase64(data.image_base64);
      } else {
        // Fallback for demo/no-backend: convert to base64 locally
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Extract base64 without prefix if needed, or keep it depending on backend.
          // The backend usually expects raw base64 or prefixed. Let's send the raw base64.
          const rawBase64 = base64String.split(',')[1] || base64String;
          setImageBase64(rawBase64);
        };
        reader.readAsDataURL(file);
      }
    } catch (e) {
      // Fallback for demo mode
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const rawBase64 = base64String.split(',')[1] || base64String;
        setImageBase64(rawBase64);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() && !imageBase64) return;
    
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input || "📷 ছবি পাঠানো হয়েছে",
      imageUrl: imagePreview || undefined,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setImagePreview(null);
    setLoading(true);

    const placeholderId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: placeholderId, role: "assistant", content: "..." },
    ]);

    try {
      const res = await fetch(`${API}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input || "",
          session_id: sessionId,
          image_base64: imageBase64,
        }),
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
    } catch (e) {
      // Mock response for demo mode if backend is down
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? { 
                  ...m, 
                  content: "দুঃখিত, সংযোগে সমস্যা হয়েছে অথবা এটি ডেমো মোড। আপনার প্রশ্নটি হলো: " + (input || "ছবি"), 
                  agentUsed: "Mock Agent" 
                }
              : m
          )
        );
      }, 1000);
    } finally {
      setLoading(false);
      setImageBase64(null);
    }
  };

  const handleFeedback = async (msgId: string, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, rating } : m))
    );
    try {
      await fetch(`${API}/api/v1/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message_id: msgId,
          rating: rating === "up" ? "thumbs_up" : "thumbs_down",
        }),
      });
    } catch (e) {
      // Ignore if backend is down
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto rounded-2xl shadow-2xl overflow-hidden glass">
      {/* Header inside container for mobile aesthetics */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center gap-3 shrink-0 z-20">
        <div className="w-10 h-10 rounded-xl bg-agri-600 shadow-md flex items-center justify-center text-white">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 leading-tight">AgriPulse Assistant</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-agri-500 animate-pulse"></span>
            <p className="text-xs text-slate-500 font-medium">Online & ready</p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide relative bg-slate-50/50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="flex gap-2 bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        loading={loading}
        onSend={sendMessage}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        onImageDrop={onImageDrop}
        clearImage={() => {
          setImagePreview(null);
          setImageBase64(null);
        }}
      />
    </div>
  );
}
