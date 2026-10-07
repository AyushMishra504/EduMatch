"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "Can I upload my CV?",
    answer:
      "Yes. Upload a PDF or Word file and we'll help you build your profile. You can review and edit everything.",
  },
  {
    id: "faq-2",
    question: "Is it free for educators?",
    answer:
      "Yes. Creating a profile and reviewing matches is completely free for educators.",
  },
  {
    id: "faq-3",
    question: "Who can see my profile?",
    answer:
      "You control visibility. Your profile is private by default and only shared when you choose to connect with an institution.",
  },
  {
    id: "faq-4",
    question: "Do I need to fill everything in to start?",
    answer:
      "No. You can start with your CV or basic answers, and add more details whenever you're ready.",
  },
  {
    id: "faq-5",
    question: "Is EduMatch live yet?",
    answer:
      "We are currently onboarding founding educators across India. Matching roles go live in the upcoming academic hiring cycle.",
  },
];

export function Faq() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  return (
    <section
      id="faq"
      className="scroll-mt-20 border-b border-[#E5E7EB] bg-[#FAFAFA] py-28 dark:border-[#1F1F1F] dark:bg-[#0A0A0A] lg:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 font-serif text-[38px] font-normal tracking-tight text-[#09090B] dark:text-white sm:text-[44px]">
          Questions, answered{" "}
          <em className="font-normal italic text-[#1F8F7E]">plainly.</em>
        </h2>

        <div className="divide-y divide-[#E5E7EB] border-t border-[#E5E7EB] dark:divide-[#1F1F1F] dark:border-[#1F1F1F]">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  aria-controls={item.id}
                  className="group flex w-full items-center justify-between text-left focus:outline-none"
                >
                  <span className="text-lg font-medium text-[#09090B] transition-colors group-hover:text-[#1F8F7E] dark:text-white dark:group-hover:text-white">
                    {item.question}
                  </span>
                  <span
                    id={`${item.id}-icon`}
                    aria-hidden="true"
                    className="ml-4 select-none text-xl font-light text-[#71717A]"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <div
                    id={item.id}
                    className="max-w-3xl pt-3 text-base leading-relaxed text-[#52525B] dark:text-[#A1A1AA]"
                  >
                    {item.answer}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}