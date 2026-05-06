/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "./types";
import { Bot, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { DosageCard } from "../widgets/DosageCard";
import { VisionDiagnosis } from "../widgets/VisionDiagnosis";
import { MarketPriceWidget } from "../widgets/MarketPriceWidget";
import { AgentMapWidget } from "../widgets/AgentMapWidget";
import { MarketTrendWidget } from "../widgets/MarketTrendWidget";
import { SoilRadarWidget } from "../widgets/SoilRadarWidget";
import { CropTimelineWidget } from "../widgets/CropTimelineWidget";
import { PestHeatmapWidget } from "../widgets/PestHeatmapWidget";
import { YieldPredictorWidget } from "../widgets/YieldPredictorWidget";

interface MessageBubbleProps {
  message: Message;
  onFeedback?: (id: string, rating: "up" | "down") => void;
  lang?: "BN" | "EN";
}

export function MessageBubble({ message, onFeedback, lang = "BN" }: MessageBubbleProps) {
  const isUser = message.role === "user";

  const renderWidget = () => {
    if (!message.widgetType || !message.widgetData) return null;
    switch (message.widgetType) {
      case "dosage_card":
        return <DosageCard data={message.widgetData} />;
      case "vision_diagnosis":
        return <VisionDiagnosis data={message.widgetData} />;
      case "market_price":
        return <MarketPriceWidget data={message.widgetData} />;
      case "agent_map":
        return <AgentMapWidget data={message.widgetData} lang={lang} />;
      case "market_trend":
        return <MarketTrendWidget data={message.widgetData} lang={lang} />;
      case "soil_radar":
        return <SoilRadarWidget data={message.widgetData} lang={lang} />;
      case "crop_timeline":
        return <CropTimelineWidget data={message.widgetData} lang={lang} />;
      case "pest_heatmap":
        return <PestHeatmapWidget data={message.widgetData} lang={lang} />;
      case "yield_predictor":
        return <YieldPredictorWidget data={message.widgetData} lang={lang} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 py-4 border-b border-agri-800/50",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-agri-800 flex items-center justify-center text-neon-green">
          <Bot size={16} />
        </div>
      )}

      <div
        className={cn("flex-1 max-w-2xl", isUser ? "text-right" : "text-left")}
      >
        {/* User Message */}
        {isUser ? (
          <div className="inline-block px-4 py-2 bg-agri-700 rounded-2xl rounded-br-sm text-sm">
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="uploaded"
                className="mt-2 rounded-lg max-h-48"
              />
            )}
          </div>
        ) : (
          /* Assistant Message */
          <>
            {message.content && (
              <div className="prose prose-invert prose-sm max-w-none mb-2">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            {renderWidget()}
          </>
        )}

        {/* Feedback & Metadata */}
        {message.role === "assistant" && message.id !== "welcome" && (
          <div className="flex items-center gap-4 mt-2 text-xs text-agri-500">
            <span className="font-mono">
              {message.agentUsed || "Agripulse AI"}
            </span>

            {onFeedback && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onFeedback(message.id, "up")}
                  className={cn(
                    "p-1 rounded hover:bg-agri-800 transition-colors",
                    message.rating === "up"
                      ? "text-neon-green"
                      : "text-agri-500",
                  )}
                >
                  <ThumbsUp size={12} />
                </button>
                <button
                  onClick={() => onFeedback(message.id, "down")}
                  className={cn(
                    "p-1 rounded hover:bg-agri-800 transition-colors",
                    message.rating === "down"
                      ? "text-neon-red"
                      : "text-agri-500",
                  )}
                >
                  <ThumbsDown size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green flex items-center justify-center text-agri-dark">
          <User size={16} />
        </div>
      )}
    </div>
  );
}
