/* eslint-disable @next/next/no-img-element */
import { Camera, Image as ImageIcon, Send, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { AgentOrb } from "../ui/AgentOrb";

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  loading: boolean;
  onSend: () => void;
  imagePreview: string | null;
  setImagePreview: (val: string | null) => void;
  onImageDrop: (files: File[]) => void;
  clearImage: () => void;
  agentStatus: "idle" | "listening" | "processing" | "alert";
  setAgentStatus: (status: "idle" | "listening" | "processing" | "alert") => void;
}

const SUGGESTIONS = ["সারের হিসাব", "পোকা দমন", "আজকের আবহাওয়া"];

export function ChatInput({
  input,
  setInput,
  loading,
  onSend,
  imagePreview,
  onImageDrop,
  clearImage,
  agentStatus,
  setAgentStatus
}: ChatInputProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    noClick: true,
  });

  const handleVoicePress = () => setAgentStatus("listening");
  const handleVoiceRelease = () => {
    setAgentStatus("processing");
    // Mock processing voice input
    setTimeout(() => {
      setInput("লিওন ভাই, ১ বিঘা জমিতে ২০ কেজি ইউরিয়া দিন।");
      setAgentStatus("idle");
    }, 1500);
  };

  return (
    <div {...getRootProps()} className="relative w-full pb-4">
      {/* Smart Suggestions */}
      {!input && !imagePreview && (
        <div className="flex gap-2 px-4 mb-4 overflow-x-auto scrollbar-hide py-1">
          {SUGGESTIONS.map((sug) => (
            <button
              key={sug}
              onClick={() => { setInput(sug); onSend(); }}
              className="whitespace-nowrap px-4 py-2 bg-agri-800/80 hover:bg-agri-700 border border-agri-600/50 rounded-full text-xs text-agri-100 transition-colors shadow-sm"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute -top-32 inset-x-0 h-32 bg-agri-900/95 backdrop-blur-md flex items-center justify-center z-20 text-neon-green text-lg font-semibold rounded-t-2xl border-2 border-dashed border-neon-green mx-4 shadow-neon-green animate-fade-in-up">
          <ImageIcon className="mr-2" /> ছবি এখানে ছাড়ুন
        </div>
      )}

      <div className="glass-card mx-2 sm:mx-4 rounded-3xl shadow-xl relative z-10 px-4 py-3 border-t-0">
        
        {/* Agent Orb - Absolute positioned in the middle */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <AgentOrb 
            status={agentStatus} 
            onPressStart={handleVoicePress} 
            onPressEnd={handleVoiceRelease} 
          />
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2 mt-8">
          <label className="cursor-pointer flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-agri-800 text-agri-300 hover:text-neon-green hover:bg-agri-700 transition-colors">
            <Camera size={20} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && onImageDrop(Array.from(e.target.files))}
            />
          </label>
          
          <div className="flex-1 bg-agri-dark/50 rounded-2xl border border-agri-600/50 focus-within:border-neon-green/50 focus-within:shadow-[0_0_10px_rgba(57,255,20,0.1)] transition-all flex items-center px-3 py-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="আপনার বার্তা লিখুন..."
              className="flex-1 max-h-24 min-h-[40px] resize-none bg-transparent py-2.5 text-sm text-white placeholder:text-agri-400 focus:outline-none scrollbar-hide"
              disabled={loading}
              rows={1}
            />
          </div>

          <button
            onClick={onSend}
            disabled={loading || (!input.trim() && !imagePreview)}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
              loading || (!input.trim() && !imagePreview)
                ? "bg-agri-800 text-agri-500"
                : "bg-neon-green text-agri-dark hover:bg-[#32e612] shadow-neon-green"
            )}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-agri-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} className="ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
