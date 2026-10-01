"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import { Logo } from "@/components/Logo";

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
  {
    question: "What does it cost?",
    answer:
      "It's free for educators and institutions. If paid features come later, we'll be clear about them before anything changes.",
  },
];

type Message = {
  id: string;
  role: "bot" | "user";
  content: string;
};

export function Faq() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "bot", content: "Hi there! I'm here to answer any questions you have about EduMatch. What would you like to know?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleAsk = (item: typeof FAQ_ITEMS[0]) => {
    if (isTyping) return;
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: item.question }
    ]);
    
    setIsTyping(true);
    
    // Simulate thinking delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "bot", content: item.answer }
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <section id="faq" className="scroll-mt-16 border-t border-rule">
      <div ref={ref} className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p
              data-inview="slide-up"
              className={`text-tiny font-semibold uppercase tracking-[0.18em] text-accent ${inView ? "in-view" : ""}`}
            >
              FAQ
            </p>
            <h2
              data-inview="slide-up"
              className={`mt-4 font-serif font-medium text-h2 text-ink ${inView ? "in-view" : ""}`}
              style={{ "--delay": "80ms" } as React.CSSProperties}
            >
              Questions, answered plainly.
            </h2>
            <p
              data-inview="slide-up"
              className={`mt-4 max-w-sm text-body text-ink-muted ${inView ? "in-view" : ""}`}
              style={{ "--delay": "140ms" } as React.CSSProperties}
            >
              Ask our guide anything about how EduMatch works, who it's for, and what to expect as we launch.
            </p>
          </div>

          <div 
            className={`lg:col-span-7 lg:col-start-6 transition-all duration-700 delay-200 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex h-[460px] flex-col rounded-2xl border border-rule bg-paper-deep shadow-card overflow-hidden">
              {/* Chat Header */}
              <div className="flex items-center gap-3 border-b border-rule bg-paper px-5 py-4">
                <Logo size={28} />
                <div>
                  <p className="text-small font-semibold text-ink leading-tight">EduMatch Guide</p>
                  <p className="text-tiny text-accent font-medium mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    Online
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 scroll-smooth">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-[slide-up_0.3s_ease-out]`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-small leading-relaxed ${
                        m.role === "user"
                          ? "bg-accent text-on-accent rounded-tr-sm shadow-sm"
                          : "bg-paper border border-rule text-ink rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start animate-[fadein_0.2s_ease-out]">
                    <div className="bg-paper border border-rule rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-ink-muted/40 rounded-full animate-[float_1s_infinite]" />
                      <span className="w-1.5 h-1.5 bg-ink-muted/40 rounded-full animate-[float_1s_infinite_0.2s]" />
                      <span className="w-1.5 h-1.5 bg-ink-muted/40 rounded-full animate-[float_1s_infinite_0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Suggestions */}
              <div className="border-t border-rule bg-paper p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-2.5 px-1">
                  Ask a question
                </p>
                <div className="flex flex-wrap gap-2">
                  {FAQ_ITEMS.map((item) => (
                    <button
                      key={item.question}
                      onClick={() => handleAsk(item)}
                      disabled={isTyping}
                      className="rounded-full border border-rule bg-paper-deep px-3.5 py-1.5 text-tiny font-medium text-ink-muted hover:text-ink hover:border-accent/40 hover:bg-accent-tint/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 group"
                    >
                      <MessageSquare size={14} className="text-ink-muted/50 group-hover:text-accent/70 transition-colors" />
                      {item.question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}