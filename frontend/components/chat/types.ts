export type WidgetType = "dosage_card" | "vision_diagnosis" | "market_price" | "weather_risk";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string; // The prose or fallback text
  imageUrl?: string;
  agentUsed?: string;
  rating?: "up" | "down";
  widgetType?: WidgetType;
  widgetData?: any; // Contains structured data for the specific widget
}
