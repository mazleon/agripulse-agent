"use client";
import { Play, Square } from "lucide-react";
import { useState, useEffect } from "react";

export function TTSButton({ text }: { text: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(50); // Small haptic feedback
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-BD"; // Bengali
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      onClick={handlePlay}
      className="p-1.5 bg-agri-700 hover:bg-agri-600 rounded-full text-neon-green transition-colors"
      aria-label="Play text aloud"
    >
      {isPlaying ? <Square fill="currentColor" size={14} /> : <Play fill="currentColor" size={14} />}
    </button>
  );
}
