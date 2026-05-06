import { ChatContainer } from "@/components/chat/ChatContainer";

export default function HomePage() {
  return (
    <main className="flex flex-col h-[100dvh] w-full bg-black sm:p-4 md:p-8 items-center justify-center">
      {/* 
        The container handles the full screen on mobile (100dvh) 
        and shows up as a centered max-w-lg device-like frame on desktop.
      */}
      <div className="w-full h-full max-w-2xl relative sm:rounded-[2.5rem] sm:border-[8px] sm:border-agri-900 shadow-2xl overflow-hidden bg-agri-dark">
        <ChatContainer />
      </div>
    </main>
  );
}
