"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDropzone } from "react-dropzone";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  agentUsed?: string;
  rating?: "up" | "down";
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8033";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8033";

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "আস্সালামু আলাইকুম! আমি AgriPulse। আপনার ফসল, পোকামাকড়, আবহাওয়া বা পশু-পাখি সম্পর্কে যেকোনো প্রশ্ন করুন। ছবিও পাঠাতে পারেন।",
    },
  ]);
  const [input, setInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    // Upload to backend and get base64
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${API}/api/v1/chat/upload-image`, { method: "POST", body: fd });
    const data = await res.json();
    if (data.image_base64) setImageBase64(data.image_base64);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    noClick: true,
  });

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
      { id: placeholderId, role: "assistant", content: "…" },
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
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: data.response, agentUsed: data.agent_used }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: "❌ সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।" }
            : m
        )
      );
    } finally {
      setLoading(false);
      setImageBase64(null);
    }
  };

  const handleFeedback = async (msgId: string, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, rating } : m))
    );
    await fetch(`${API}/api/v1/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        message_id: msgId,
        rating: rating === "up" ? "thumbs_up" : "thumbs_down",
      }),
    }).catch(() => {});
  };

  return (
    <div
      {...getRootProps()}
      className="w-full max-w-2xl flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden border border-green-100"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <input {...getInputProps()} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isDragActive && (
          <div className="absolute inset-0 bg-green-50/90 flex items-center justify-center z-10 text-green-700 text-lg font-semibold rounded-2xl border-2 border-dashed border-green-400">
            ছবি এখানে ছাড়ুন
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-green-700 text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="uploaded" className="rounded-lg mb-2 max-h-48 object-contain" />
              )}
              {msg.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm max-w-none">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
              {msg.role === "assistant" && msg.id !== "welcome" && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                  {msg.agentUsed && (
                    <span className="text-xs text-gray-400 flex-1">{msg.agentUsed}</span>
                  )}
                  <button
                    onClick={() => handleFeedback(msg.id, "up")}
                    className={`text-base ${msg.rating === "up" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
                  >👍</button>
                  <button
                    onClick={() => handleFeedback(msg.id, "down")}
                    className={`text-base ${msg.rating === "down" ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
                  >👎</button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="px-4 py-2 bg-green-50 flex items-center gap-2">
          <img src={imagePreview} alt="preview" className="h-12 w-12 rounded object-cover" />
          <span className="text-sm text-green-700 flex-1">ছবি যুক্ত হয়েছে</span>
          <button onClick={() => { setImagePreview(null); setImageBase64(null); }} className="text-red-500 text-sm">✕</button>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-gray-100 p-3 flex gap-2 bg-white">
        <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
          📷
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
          />
        </label>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="আপনার প্রশ্ন লিখুন…"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || (!input.trim() && !imageBase64)}
          className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center hover:bg-green-800 disabled:opacity-40 transition-colors"
        >
          {loading ? "…" : "↑"}
        </button>
      </div>
    </div>
  );
}
