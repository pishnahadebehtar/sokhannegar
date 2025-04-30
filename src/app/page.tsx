"use client";

import { useRef, useState } from "react";
import { SignedIn } from "@clerk/nextjs";
import Hero from "@/components/Hero";
import CopywritingStepper from "@/components/Stepper";
import StepsExplanation from "@/components/StepsExplanation";
import Chat from "@/components/chat";

export default function Home() {
  const stepperRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"copywriting" | "chat">("copywriting"); // Default to copywriting

  const scrollToComponent = () => {
    if (mode === "copywriting" && stepperRef.current) {
      stepperRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (mode === "chat" && chatRef.current) {
      chatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Hero
        onCallToActionClick={scrollToComponent}
        mode={mode}
        setMode={setMode}
      />

      {mode === "copywriting" ? (
        <div ref={stepperRef}>
          <StepsExplanation />
          <CopywritingStepper />
        </div>
      ) : (
        <SignedIn>
          <div ref={chatRef}>
            <Chat />
          </div>
        </SignedIn>
      )}
    </>
  );
}
