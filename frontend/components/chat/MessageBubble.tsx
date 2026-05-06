/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "./types";
import { Bot, ThumbsDown, ThumbsUp, User } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  onFeedback?: (id: string, rating: "up" | "down") => void;
}

export function MessageBubble({ message, onFeedback }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex w-full animate-fade-in-up", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] md:max-w-[75%] gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
        {/* Avatar */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
          isUser ? "bg-agri-600 text-white" : "bg-earth-100 text-earth-800 border border-earth-200"
        )}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content Box */}
        <div className={cn(
          "flex flex-col gap-2 rounded-2xl px-5 py-3.5 shadow-sm",
          isUser 
            ? "bg-agri-600 text-white rounded-tr-sm" 
            : "glass text-slate-800 rounded-tl-sm border border-slate-100"
        )}>
          {message.imageUrl && (
            <img 
              src={message.imageUrl} 
              alt="uploaded" 
              className="rounded-lg max-h-60 object-contain w-full bg-black/5" 
            />
          )}
          
          <div className={cn(
            "prose prose-sm max-w-none break-words",
            isUser ? "prose-invert" : "prose-slate"
          )}>
            {message.role === "assistant" ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            ) : (
              <p className="whitespace-pre-wrap m-0">{message.content}</p>
            )}
          </div>

          {/* Footer (Agent info & Feedback) */}
          {message.role === "assistant" && message.id !== "welcome" && (
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200/50">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium bg-slate-100/50 px-2 py-0.5 rounded-full">
                {message.agentUsed || "Agent"}
              </span>
              
              {onFeedback && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onFeedback(message.id, "up")}
                    className={cn(
                      "p-1.5 rounded-md hover:bg-slate-100 transition-colors",
                      message.rating === "up" ? "text-agri-600 bg-agri-50" : "text-slate-400"
                    )}
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => onFeedback(message.id, "down")}
                    className={cn(
                      "p-1.5 rounded-md hover:bg-slate-100 transition-colors",
                      message.rating === "down" ? "text-red-500 bg-red-50" : "text-slate-400"
                    )}
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
