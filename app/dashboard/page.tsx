"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CHAT_MODES, ChatMode } from "@/lib/chat-modes";
import { 
  Heart, 
  Wind, 
  Zap, 
  Moon, 
  Sparkles, 
  Sun, 
  LogOut,
  MessageCircle,
  Shield,
  Lightbulb,
  ClipboardCheck,
  LifeBuoy,
  Stethoscope
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Wind,
  Zap,
  Moon,
  Sparkles,
  Sun,
  Lightbulb,
  ClipboardCheck,
  LifeBuoy,
};

interface User {
  id?: number;
  email: string;
  name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const storedToken = sessionStorage.getItem("session_token");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      } catch {
        // Continue to login
      }
    }
    router.push("/login");
  }, [router]);

  const handleLogout = async () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("session_token");
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const selectMode = (mode: ChatMode) => {
    sessionStorage.setItem("chat_mode", mode);
    router.push("/chat");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Spinner className="h-8 w-8 text-teal-600" />
      </main>
    );
  }

  if (!user) return null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const supportModes = Object.values(CHAT_MODES).filter(m => m.category === "support");
  const toolsModes = Object.values(CHAT_MODES).filter(m => m.category === "tools");
  const resourceModes = Object.values(CHAT_MODES).filter(m => m.category === "resources");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-semibold text-slate-800">MindfulChat</span>
              <p className="text-xs text-slate-500">with Dr. Aria</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-slate-600 hover:text-slate-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {getGreeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="text-slate-600">
            I am Dr. Aria, your mental wellness companion. How can I support you today?
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Card className="bg-white/70 backdrop-blur border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Your Safe Space</p>
                <p className="text-lg font-semibold text-slate-800">Confidential</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Non-Judgmental</p>
                <p className="text-lg font-semibold text-slate-800">Always Supportive</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/70 backdrop-blur border-slate-200">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Heart className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Empathetic Care</p>
                <p className="text-lg font-semibold text-slate-800">Here For You</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Support Modes */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-teal-600" />
            Support Sessions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportModes.map((mode) => {
              const IconComponent = iconMap[mode.icon];
              return (
                <Card 
                  key={mode.id}
                  className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur border-2 ${mode.borderColor} hover:border-opacity-100 border-opacity-50`}
                  onClick={() => selectMode(mode.id)}
                >
                  <CardContent className="p-6">
                    <div className={`h-14 w-14 rounded-2xl ${mode.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {IconComponent && <IconComponent className={`h-7 w-7 ${mode.color}`} />}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{mode.name}</h3>
                    <p className="text-sm text-slate-500">{mode.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Tools Modes */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-orange-600" />
            Wellness Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolsModes.map((mode) => {
              const IconComponent = iconMap[mode.icon];
              return (
                <Card 
                  key={mode.id}
                  className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur border-2 ${mode.borderColor} hover:border-opacity-100 border-opacity-50`}
                  onClick={() => selectMode(mode.id)}
                >
                  <CardContent className="p-6">
                    <div className={`h-14 w-14 rounded-2xl ${mode.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {IconComponent && <IconComponent className={`h-7 w-7 ${mode.color}`} />}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{mode.name}</h3>
                    <p className="text-sm text-slate-500">{mode.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Crisis Resources */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-red-600" />
            Crisis Support
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resourceModes.map((mode) => {
              const IconComponent = iconMap[mode.icon];
              return (
                <Card 
                  key={mode.id}
                  className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur border-2 ${mode.borderColor} hover:border-opacity-100 border-opacity-50`}
                  onClick={() => selectMode(mode.id)}
                >
                  <CardContent className="p-6">
                    <div className={`h-14 w-14 rounded-2xl ${mode.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      {IconComponent && <IconComponent className={`h-7 w-7 ${mode.color}`} />}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{mode.name}</h3>
                    <p className="text-sm text-slate-500">{mode.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Emergency Hotlines */}
        <section className="mb-8 p-6 bg-red-50 rounded-xl border border-red-200">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Emergency Hotlines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-red-700">National Suicide Prevention</p>
              <p className="text-red-600">Call or text: 988 (US)</p>
            </div>
            <div>
              <p className="font-medium text-red-700">Crisis Text Line</p>
              <p className="text-red-600">Text HOME to 741741</p>
            </div>
            <div>
              <p className="font-medium text-red-700">Emergency Services</p>
              <p className="text-red-600">Call: 911 (US) / 999 (UK)</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="p-4 bg-white/50 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 text-center">
            MindfulChat with Dr. Aria is an AI wellness companion. It is not a replacement for professional mental health care, 
            diagnosis, or treatment. If you are experiencing a mental health emergency, please contact emergency services immediately.
          </p>
        </section>
      </div>
    </main>
  );
}
