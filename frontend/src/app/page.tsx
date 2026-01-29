"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Smile, Wind, Lightbulb, MessageCircle } from "lucide-react";
import { useMood, MoodProvider } from "@/components/mood-provider";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Button = ({ className, size, ...props }: any) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      "bg-primary text-white hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20",
      "h-10 px-4 py-2",
      className
    )}
    {...props}
  />
);

const Input = ({ className, ...props }: any) => (
  <input
    className={cn(
      "flex h-12 w-full rounded-xl border border-border bg-white/70 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-sm shadow-inner transition-all",
      className
    )}
    {...props}
  />
);

function ActivityCard({ activity, type }: { activity: string, type: string }) {
  if (!activity) return null;

  let Icon = Lightbulb;
  let bgColor = "bg-sky-50 border-sky-200 text-sky-800";

  if (type?.includes("joke")) {
    Icon = Smile;
    bgColor = "bg-yellow-50 border-yellow-200 text-yellow-800";
  } else if (type?.includes("meditation")) {
    Icon = Wind;
    bgColor = "bg-indigo-50 border-indigo-200 text-indigo-800";
  }

  return (
    <div className={cn("mt-2 mb-2 p-4 rounded-2xl border flex items-start gap-3 animate-fade-in shadow-sm", bgColor)}>
      <div className="p-2 bg-white rounded-full bg-opacity-50 shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-sm opacity-90 uppercase tracking-widest text-[10px]">Suggested Activity</h4>
        <p className="text-sm font-medium leading-relaxed">{activity}</p>
      </div>
    </div>
  );
}

function ChatInterface() {
  const { mood, setMood } = useMood();
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Hi. I'm your AI Stress Reducer. I'm here to listen and help you feel better. How are things?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (text?: string) => {
    const msgText = text || input;
    if (!msgText.trim()) return;

    const userMsg = { role: "user", content: msgText, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      const newMsg = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        suggested_activity: data.suggested_activity,
        activity_type: data.activity_type
      };

      setMessages((prev) => [...prev, newMsg]);

      if (data.mood) {
        setMood(data.mood);
      }

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting. Let's try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action Buttons
  const handleQuickAction = (action: string) => {
    let text = "";
    if (action === "joke") text = "Tell me a joke to cheer me up.";
    if (action === "vent") text = "I need to vent about my day.";
    if (action === "breathe") text = "Help me relax with a breathing exercise.";
    sendMessage(text);
  };

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 animate-fade-in px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-colors duration-500">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">AI Stress Reducer</h1>
            <p className="text-xs font-medium text-primary transition-colors duration-500">
              Mood: {mood}
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-2xl overflow-hidden flex flex-col relative animate-fade-in ring-1 ring-white/80">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-4 max-w-[85%] md:max-w-[70%] animate-fade-in group",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white transition-colors duration-500",
                  msg.role === "assistant" ? "bg-white" : "bg-primary text-white"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="w-5 h-5 text-slate-600" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              <div className={cn(
                "flex flex-col space-y-1 min-w-0 max-w-full",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div
                  className={cn(
                    "rounded-3xl px-6 py-3.5 text-[15px] shadow-sm leading-relaxed transition-all duration-500 relative",
                    msg.role === "user"
                      ? "bg-secondary text-white rounded-tr-sm shadow-md"
                      : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm"
                  )}
                >
                  {msg.content}
                </div>

                {/* Activity Card (Only for Assistant) */}
                {msg.role === 'assistant' && msg.suggested_activity && (
                  <ActivityCard activity={msg.suggested_activity} type={msg.activity_type} />
                )}

                <span className={cn(
                  "text-[10px] font-medium px-2 transition-opacity opacity-0 group-hover:opacity-100",
                  msg.role === "user" ? "text-right text-slate-500" : "text-slate-400"
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 border border-white shadow-sm">
                <Bot className="w-5 h-5 text-slate-600" />
              </div>
              <div className="bg-white/80 px-5 py-4 rounded-3xl rounded-tl-sm border border-slate-100 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions (only show if no input) */}
        {!input && (
          <div className="px-4 md:px-6 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleQuickAction("joke")}
              className="whitespace-nowrap px-4 py-2 bg-white/50 hover:bg-white text-xs font-medium text-slate-600 rounded-full border border-slate-200 transition-all shadow-sm"
            >
              😊 Tell me a joke
            </button>
            <button
              onClick={() => handleQuickAction("breathe")}
              className="whitespace-nowrap px-4 py-2 bg-white/50 hover:bg-white text-xs font-medium text-slate-600 rounded-full border border-slate-200 transition-all shadow-sm"
            >
              🧘 Help me relax
            </button>
            <button
              onClick={() => handleQuickAction("vent")}
              className="whitespace-nowrap px-4 py-2 bg-white/50 hover:bg-white text-xs font-medium text-slate-600 rounded-full border border-slate-200 transition-all shadow-sm"
            >
              🗣 I need to vent
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white/40 border-t border-white/50 backdrop-blur-xl">
          <div className="flex gap-3 max-w-3xl mx-auto relative group">
            <Input
              value={input}
              onChange={(e: any) => setInput(e.target.value)}
              onKeyDown={(e: any) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              className="pr-14 pl-6 h-14 rounded-2xl text-[15px] shadow-sm border-slate-200/60 focus:bg-white transition-all duration-300"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              size="icon"
              className="absolute right-2 top-2 bottom-2 w-10 h-10 rounded-xl transition-all duration-500 shadow-md"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-3 font-medium tracking-wide opacity-80">
            AI Stress Reducer • Your personal wellness companion
          </p>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <MoodProvider>
      <ChatInterface />
    </MoodProvider>
  );
}
