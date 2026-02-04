"use client";

import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useTheme } from "next-themes";

export function DashboardTour({
  shouldRun,
  onComplete,
}: {
  shouldRun: boolean;
  onComplete?: () => void;
}) {
  const [run, setRun] = useState(false);
  const { theme } = useTheme();

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      title: "Welcome to GroqTales! 🧞‍♂️",
      content: "This is your Creator Dashboard. Let's take a quick tour to help you start earning.",
      disableBeacon: true,
    },
    {
      target: ".tour-create-story",
      content: "Click here to generate your first AI-powered story using Groq.",
    },
    {
      target: ".tour-wallet-connect",
      content: "Connect your wallet (MetaMask/Rainbow) here. This is required to mint NFTs and receive earnings.",
    },
    {
      target: ".tour-analytics",
      content: "Track your story views, NFT sales, and royalties in real-time here.",
    },
  ];

  useEffect(() => {
    setRun(shouldRun);
  }, [shouldRun]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      onComplete?.();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: theme === "dark" ? "#a855f7" : "#7c3aed",
          backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
          textColor: theme === "dark" ? "#f3f4f6" : "#111827",
        },
      }}
    />
  );
}