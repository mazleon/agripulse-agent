/* eslint-disable @next/next/no-img-element */
import { Camera, Image as ImageIcon, Send, X } from "lucide-react";
import { useCallback } from "react";
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
}

export function ChatInput({
  input,
  setInput,
  loading,
  onSend,
  imagePreview,
  onImageDrop,
  clearImage,
}: ChatInputProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onImageDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    noClick: true,
  });

  return (
    <div {...getRootProps()} className="relative w-full">
      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute -top-32 inset-x-0 h-32 bg-agri-50/95 backdrop-blur-sm flex items-center justify-center z-20 text-agri-700 text-lg font-semibold rounded-t-2xl border-2 border-dashed border-agri-400 mx-4 shadow-lg animate-fade-in-up">
          <ImageIcon className="mr-2" /> ছবি এখানে ছাড়ুন
        </div>
      )}

      <div className="glass border-t border-slate-100 p-4 sm:p-6 rounded-b-2xl shadow-sm relative z-10">
        {/* Image Preview Area */}
        {imagePreview && (
          <div className="mb-4 inline-flex relative group animate-fade-in-up">
            <div className="relative rounded-xl overflow-hidden border-2 border-agri-100 shadow-sm bg-white">
              <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={clearImage}
                  className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-transform hover:scale-110"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <span className="absolute -top-2 -right-2 bg-agri-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm">
              Attached
            </span>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex items-end gap-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-agri-500/20 focus-within:border-agri-500 transition-all">
          <label className="cursor-pointer flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-agri-600 hover:bg-agri-50 transition-colors">
            <Camera size={20} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && onImageDrop(Array.from(e.target.files))}
            />
          </label>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="আপনার প্রশ্ন লিখুন (যেমন: ধানের পাতায় হলুদ দাগ কেন?)..."
            className="flex-1 max-h-32 min-h-[40px] resize-none bg-transparent py-2.5 px-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none scrollbar-hide"
            disabled={loading}
            rows={1}
          />

          <button
            onClick={onSend}
            disabled={loading || (!input.trim() && !imagePreview)}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              loading || (!input.trim() && !imagePreview)
                ? "bg-slate-100 text-slate-400"
                : "bg-agri-600 text-white hover:bg-agri-700 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            )}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
            ) : (
              <Send size={18} className="ml-0.5" />
            )}
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-400">
            কৃষি বিষয়ক যেকোনো ছবি আপলোড করে বিস্তারিত জানতে পারেন। AgriPulse AI আপনার সহায়তায় প্রস্তুত।
          </p>
        </div>
      </div>
    </div>
  );
}
