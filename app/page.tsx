import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Shield, Sparkles } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
              <Heart className="h-5 w-5 text-teal-600" />
            </div>
            <span className="font-bold text-xl text-gray-900">MindfulChat</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Your Personal Mental Wellness Companion
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            A supportive AI assistant designed to help you navigate your emotions, 
            develop coping strategies, and maintain your mental well-being.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-gray-300 px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 mb-4">
              <MessageCircle className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Supportive Conversations
            </h3>
            <p className="text-gray-600">
              Engage in meaningful conversations with an AI that listens without judgment and offers compassionate support.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 mb-4">
              <Sparkles className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Voice Responses
            </h3>
            <p className="text-gray-600">
              Listen to responses with text-to-speech, making it easier to absorb supportive messages and guidance.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 mb-4">
              <Shield className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              Private & Secure
            </h3>
            <p className="text-gray-600">
              Your conversations are private. Your data stays secure with encrypted authentication.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
          <p>
            MindfulChat is designed to provide general support and is not a substitute for 
            professional mental health care. If you are experiencing a crisis, please contact 
            a mental health professional or crisis helpline immediately.
          </p>
        </div>
      </div>
    </main>
  );
}
