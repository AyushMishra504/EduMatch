"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

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
      "Not yet. We're building and testing with the first institutions and educators, and sign-up opens with the launch.",
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
  {
    question: "How can I help shape it?",
    answer:
      "Reach out through the Join section and tell us what you'd like built. Early feedback decides what ships first.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-16 border-t border-rule">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-tiny font-semibold uppercase tracking-[0.18em] text-accent">
              FAQ
            </p>
            <h2 className="mt-4 font-serif font-medium text-h2 text-ink">
              Questions, answered plainly.
            </h2>
            <p className="mt-4 max-w-sm text-body text-ink-muted">
              Something else on your mind? Every answer updates as the product
              ships.
            </p>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="border-t border-rule">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={item.question} className="border-b border-rule">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    >
                      <h3 className="font-serif text-h3 font-medium text-ink">
                        {item.question}
                      </h3>
                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-ink-muted transition-transform duration-300 ease-out ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-xl pb-5 text-body text-ink-muted">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}