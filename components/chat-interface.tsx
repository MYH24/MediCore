"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Volume2, VolumeX, Loader2, Trash2, ArrowLeft, Stethoscope, User } from "lucide-react";
import { ChatMode, getModeWelcome, getModeConfig } from "@/lib/chat-modes";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  userName: string;
  mode: ChatMode;
}

export function ChatInterface({ userName, mode }: ChatInterfaceProps) {
  const router = useRouter();
  const modeConfig = getModeConfig(mode);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingId, setSpeakingId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    loadHistory();
    
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    try {
      const token = sessionStorage.getItem("session_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/chat/history", { headers });
      const data = await res.json();
      if (data.history) {
        const formattedMessages: Message[] = [];
        let id = 1;
        data.history.forEach((item: { message: string; response: string }) => {
          formattedMessages.push({ id: id++, role: "user", content: item.message });
          formattedMessages.push({ id: id++, role: "assistant", content: item.response });
        });
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const speak = (text: string, messageId: number) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();

    if (isSpeaking && speakingId === messageId) {
      setIsSpeaking(false);
      setSpeakingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.includes("Natural") || voice.name.includes("Google") || voice.name.includes("Samantha"))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingId(messageId);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingId(null);
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setSpeakingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem("session_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: userMessage, mode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Auto-speak the response
      speak(data.response, assistantMsg.id);
    } catch (error) {
      console.error("Chat error:", error);
      // Remove the user message that failed
      setMessages((prev) => prev.filter(m => m.id !== userMsg.id));
      setInput(userMessage); // Restore the input so user can try again
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      const token = sessionStorage.getItem("session_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      await fetch("/api/chat/history", { method: "DELETE", headers });
      setMessages([]);
      stopSpeaking();
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  const welcomeMessage = getModeWelcome(mode);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${modeConfig.borderColor} bg-white`}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="text-slate-600 hover:text-slate-800 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500`}>
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Dr. Aria</h2>
            <p className="text-xs text-slate-500">{modeConfig.name}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-slate-500 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg">
              <Stethoscope className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-medium text-slate-700 mb-3">
              Welcome, {userName.split(" ")[0]}
            </h3>
            <div className={`max-w-md p-4 rounded-xl ${modeConfig.bgColor} border ${modeConfig.borderColor}`}>
              <p className="text-slate-600 leading-relaxed">
                {welcomeMessage}
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
            )}
            <Card
              className={`max-w-[80%] p-4 shadow-sm ${
                message.role === "user"
                  ? "bg-slate-800 text-white border-0"
                  : `bg-white text-slate-700 border ${modeConfig.borderColor}`
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              {message.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    isSpeaking && speakingId === message.id
                      ? stopSpeaking()
                      : speak(message.content, message.id)
                  }
                  className={`mt-2 h-7 px-2 text-xs ${
                    isSpeaking && speakingId === message.id
                      ? "text-teal-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {isSpeaking && speakingId === message.id ? (
                    <>
                      <VolumeX className="h-3 w-3 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3 w-3 mr-1" />
                      Listen
                    </>
                  )}
                </Button>
              )}
            </Card>
            {message.role === "user" && (
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="h-4 w-4 text-slate-600" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
            <Card className={`p-4 bg-white border ${modeConfig.borderColor}`}>
              <div className="flex items-center gap-2 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Dr. Aria is thinking...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what is on your mind..."
            disabled={isLoading}
            className="flex-1 border-slate-200 focus:border-teal-400 focus:ring-teal-400"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          Dr. Aria is an AI companion. For emergencies, contact professional help or call 988.
        </p>
      </form>
    </div>
  );
}
