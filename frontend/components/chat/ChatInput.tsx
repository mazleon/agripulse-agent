/* eslint-disable @next/next/no-img-element */
import { Camera, Send, X, Mic, Paperclip } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

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
  setAgentStatus: (
    status: "idle" | "listening" | "processing" | "alert",
  ) => void;
  lang: "BN" | "EN";
}

const SUGGESTIONS = {
  BN: ["সারের হিসাব", "পোকা দমন", "আজকের আবহাওয়া"],
  EN: ["Fertilizer Calc", "Pest Control", "Today's Weather"],
};

export function ChatInput({
  input,
  setInput,
  loading,
  onSend,
  imagePreview,
  onImageDrop,
  clearImage,
  agentStatus,
  setAgentStatus,
  lang,
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
    setTimeout(() => {
      setInput(
        lang === "BN"
          ? "লিওন ভাই, ১ বিঘা জমিতে ২০ কেজি ইউরিয়া দিন।"
          : "Leon bhai, apply 20 kg of Urea in 1 bigha land.",
      );
      setAgentStatus("idle");
    }, 1500);
  };

  return (
    <div className="w-full">
      {/* Smart Suggestions */}
      {!input && !imagePreview && (
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {SUGGESTIONS[lang].map((sug) => (
            <button
              key={sug}
              onClick={() => {
                setInput(sug);
                onSend();
              }}
              className="whitespace-nowrap px-3 py-1.5 bg-agri-800 hover:bg-agri-700 rounded-full text-xs text-agri-200 transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Drag overlay */}
      {isDragActive && (
        <div className="mb-3 p-8 border-2 border-dashed border-neon-green rounded-lg bg-agri-800/50 flex items-center justify-center text-neon-green">
          <Paperclip className="mr-2" />{" "}
          {lang === "BN" ? "ছবি ছাড়ুন" : "Drop image here"}
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-32 rounded-lg"
          />
          <button
            onClick={clearImage}
            className="absolute -top-2 -right-2 p-1 bg-agri-800 rounded-full text-white hover:bg-agri-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Container */}
      <div
        {...getRootProps()}
        className={cn(
          "flex items-end gap-2 p-3 rounded-xl border transition-all",
          isDragActive
            ? "border-neon-green bg-agri-800/50"
            : "border-agri-700 bg-agri-800 focus-within:border-neon-green",
        )}
      >
        {/* Attachment Button */}
        <label className="cursor-pointer p-2 text-agri-400 hover:text-neon-green transition-colors">
          <Paperclip size={18} />
          <input {...getInputProps()} className="hidden" />
        </label>

        {/* Camera Button */}
        <label className="cursor-pointer p-2 text-agri-400 hover:text-neon-green transition-colors">
          <Camera size={18} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files && onImageDrop(Array.from(e.target.files))
            }
          />
        </label>

        {/* Mic Button */}
        <button
          onPointerDown={handleVoicePress}
          onPointerUp={handleVoiceRelease}
          onPointerLeave={handleVoiceRelease}
          className={cn(
            "p-2 rounded-lg transition-colors",
            agentStatus === "listening"
              ? "text-neon-green bg-neon-green/20"
              : "text-agri-400 hover:text-neon-green",
          )}
        >
          <Mic size={18} />
        </button>

        {/* Text Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={
            lang === "BN"
              ? "Agripulse AI-কে জিজ্ঞাসা করুন..."
              : "Ask Agripulse AI..."
          }
          className="flex-1 min-h-[40px] max-h-40 resize-none bg-transparent py-2 text-sm text-white placeholder:text-agri-500 focus:outline-none scrollbar-hide"
          disabled={loading}
          rows={1}
        />

        {/* Send Button */}
        <button
          onClick={onSend}
          disabled={loading || !input.trim()}
          className={cn(
            "p-2 rounded-lg transition-colors",
            loading || !input.trim()
              ? "bg-agri-700 text-agri-500 cursor-not-allowed"
              : "bg-neon-green text-agri-dark hover:bg-[#32e612]",
          )}
        >
          <Send size={18} />
        </button>
      </div>

      <p className="text-center text-[10px] text-agri-600 mt-2">
        {lang === "BN"
          ? "Agripulse AI ভবিষ্যতে AI সহায়তা দিবে। সঠিক তথ্যের জন্য বিশেষজ্ঞের পরামর্শ নিন।"
          : "Agripulse AI will provide AI assistance in the future. Consult an expert for accurate information."}
      </p>
    </div>
  );
}
