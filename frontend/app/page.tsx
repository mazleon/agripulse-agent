import ChatWindow from "@/components/ChatWindow";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center min-h-screen p-4">
      <header className="w-full max-w-2xl flex items-center gap-3 py-4 mb-2">
        <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white text-xl font-bold">
          🌾
        </div>
        <div>
          <h1 className="text-xl font-bold text-green-800">AgriPulse</h1>
          <p className="text-sm text-green-600">বাংলাদেশের কৃষকদের AI সহকারী</p>
        </div>
      </header>
      <ChatWindow />
    </main>
  );
}
