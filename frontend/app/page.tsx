import { ChatContainer } from "@/components/chat/ChatContainer";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen p-4 md:p-8">
      {/* 
        Header is moved inside the ChatContainer to make the design more cohesive
        and app-like. The main page just acts as a padding wrapper.
      */}
      <div className="flex-1 w-full flex items-center justify-center">
        <ChatContainer />
      </div>
    </main>
  );
}
