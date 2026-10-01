"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Bot, X, Send } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "What is EduMatch?",
    answer:
      "EduMatch connects educators with institutions for teaching and research roles in India. It's a place for one clear profile, matched roles, and open applications.",
  },
  {
    question: "Who is it for?",
    answer:
      "Educators — from early-career researchers to experienced faculty — and institutions hiring for teaching and research positions.",
  },
  {
    question: "Is it live yet?",
    answer:
      "Sign-up is open — create your account with Google today. Profiles, matching, and dashboards are rolling out, and early feedback decides what ships first.",
  },
  {
    question: "How does matching work?",
    answer:
      "Profiles are matched to roles by discipline, experience, and the preferences you set. You stay in control of your profile and what's visible to institutions.",
  },
];

type Message = {
  id: string;
  role: "bot" | "user";
  content: string;
};

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", content: "Hi there! I'm here to answer any questions you have about EduMatch. What would you like to know?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleAsk = (question: string, answer: string) => {
    if (isTyping) return;
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: question }
    ]);
    
    setIsTyping(true);
    
    // Simulate thinking delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "bot", content: answer }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/5 transition-all hover:scale-105 active:scale-95 ${isOpen ? "rotate-90 opacity-0 pointer-events-none" : "rotate-0 opacity-100"}`}
        aria-label="Open chat"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col rounded-2xl border border-rule bg-paper shadow-2xl transition-all duration-300 origin-bottom-right ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-50 opacity-0 pointer-events-none translate-y-10"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule bg-paper-deep px-4 py-3 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-on-accent">
              <Bot size={16} />
            </div>
            <div>
              <p className="text-small font-semibold text-ink leading-tight">EduMatch Guide</p>
              <p className="text-tiny text-accent font-medium mt-0.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-ink-muted hover:text-ink transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper scroll-smooth">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-[slide-up_0.2s_ease-out]`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-small leading-relaxed ${
                  m.role === "user"
                    ? "bg-accent text-on-accent rounded-tr-sm"
                    : "bg-paper-deep border border-rule text-ink rounded-tl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-[fadein_0.2s_ease-out]">
              <div className="bg-paper-deep border border-rule rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 bg-ink-muted/40 rounded-full animate-[float_1s_infinite]" />
                <span className="w-1.5 h-1.5 bg-ink-muted/40 rounded-full animate-[float_1s_infinite_0.2s]" />
                <span className="w-1.5 h-1.5 bg-ink-muted/40 rounded-full animate-[float_1s_infinite_0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Questions (Instead of input) */}
        <div className="border-t border-rule bg-paper-deep p-3 rounded-b-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-2 px-1">
            Suggested
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar snap-x">
            {FAQ_ITEMS.map((item) => (
              <button
                key={item.question}
                onClick={() => handleAsk(item.question, item.answer)}
                disabled={isTyping}
                className="whitespace-nowrap shrink-0 snap-start rounded-full border border-rule bg-paper px-3 py-1.5 text-tiny font-medium text-ink-muted hover:text-ink hover:border-accent/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {item.question}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
