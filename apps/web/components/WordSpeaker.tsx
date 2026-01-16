"use client";

import { useMemo, useState } from "react";
import { cn } from "../lib/cn";

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices?.() ?? [];
  // Prefer en-US, then any en-*
  return (
    voices.find((v) => v.lang?.toLowerCase() === "en-us") ??
    voices.find((v) => v.lang?.toLowerCase().startsWith("en-")) ??
    null
  );
}

export function WordSpeaker(props: {
  text: string;
  lang?: string; // default en-US
  rate?: number; // default 0.9
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { text, lang = "en-US", rate = 0.9, ariaLabel = "播放發音", size = "md" } = props;
  const [error, setError] = useState<string | null>(null);

  const supported = useMemo(() => {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }, []);

  const speak = () => {
    setError(null);
    if (!supported) {
      setError("此瀏覽器不支援發音功能");
      return;
    }

    const t = text.trim();
    if (!t) return;

    try {
      // Stop any ongoing speech so repeated taps feel responsive.
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(t);
      u.lang = lang;
      u.rate = rate;

      // Try pick a best available English voice (optional).
      const voice = pickEnglishVoice();
      if (voice) u.voice = voice;

      window.speechSynthesis.speak(u);
    } catch {
      setError("發音失敗，請稍後再試");
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={speak}
        className={cn("inline-flex items-center justify-center rounded-[24px] border border-border bg-white text-mutedForeground hover:bg-muted hover:text-foreground", size === "sm" ? "h-6 w-6" : size === "md" ? "h-9 w-9" : "h-12 w-12")}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {/* Speaker icon */}
        <svg
          width={size === "sm" ? "12" : size === "md" ? "18" : "24"}
          height={size === "sm" ? "12" : size === "md" ? "18" : "24"}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M11 5L6.5 9H3v6h3.5L11 19V5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 8.5a4 4 0 0 1 0 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M18.5 6a8 8 0 0 1 0 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}

