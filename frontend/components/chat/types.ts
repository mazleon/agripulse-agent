export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  agentUsed?: string;
  rating?: "up" | "down";
}
