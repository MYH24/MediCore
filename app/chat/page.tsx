"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat-interface";
import { Spinner } from "@/components/ui/spinner";
import { ChatMode, CHAT_MODES } from "@/lib/chat-modes";

interface User {
  email: string;
  name: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<ChatMode>("general");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the selected mode from sessionStorage and validate it
    const storedMode = sessionStorage.getItem("chat_mode");
    if (storedMode && CHAT_MODES[storedMode as ChatMode]) {
      setMode(storedMode as ChatMode);
    } else {
      setMode("general");
    }

    // Check for user session
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("session_token");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      } catch {
        // Invalid JSON, continue to API check
      }
    }

    // Fallback to API check
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        
        if (data.user) {
          setUser(data.user);
          sessionStorage.setItem("user", JSON.stringify(data.user));
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Spinner className="h-8 w-8 text-teal-600" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto max-w-3xl h-screen py-4 px-4">
        <div className="h-full bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          <ChatInterface userName={user.name} mode={mode} />
        </div>
      </div>
    </main>
  );
}
