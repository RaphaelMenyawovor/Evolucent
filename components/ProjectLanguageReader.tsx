"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "English" as const, label: "English", flag: "🇬🇧" },
  { code: "Twi" as const, label: "Twi", flag: "🇬🇭" },
  { code: "Ewe" as const, label: "Ewe", flag: "🇬🇭" },
  { code: "Ga" as const, label: "Ga", flag: "🇬🇭" },
  { code: "Dagbani" as const, label: "Dagbani", flag: "🇬🇭" },
  { code: "Fante" as const, label: "Fante", flag: "🇬🇭" },
];

const SPEECH_LANG: Record<string, string> = {
  English: "en-GH",
  Twi: "ak-GH",
  Ewe: "ee-GH",
  Ga: "gaa-GH",
  Dagbani: "dag-GH",
  Fante: "fat-GH",
};

type Props = {
  projectTitle: string;
  projectDescription: string;
  projectRegion: string;
  amountRaised: number;
  targetAmount: number;
};

type State = "idle" | "loading" | "playing" | "done" | "error";

export function ProjectLanguageReader({
  projectTitle,
  projectDescription,
  projectRegion,
  amountRaised,
  targetAmount,
}: Props) {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [translatedText, setTranslatedText] = useState("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setState((s) => (s === "playing" ? "done" : s));
  }, []);

  const pickVoice = useCallback((langCode: string) => {
    const voices = window.speechSynthesis.getVoices();
    const want = SPEECH_LANG[langCode] ?? "en-GH";
    const byLang = voices.find((v) => v.lang.toLowerCase().startsWith(want.slice(0, 2)));
    const enGh = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    return byLang ?? enGh ?? voices[0] ?? null;
  }, []);

  const handleLanguageSelect = async (lang: string) => {
    window.speechSynthesis.cancel();
    setSelectedLang(lang);
    setState("loading");
    setTranslatedText("");

    try {
      const res = await fetch("/api/translate-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle,
          projectDescription,
          projectRegion,
          amountRaised,
          targetAmount,
          language: lang,
        }),
      });

      const data = (await res.json()) as { text?: string; error?: string };

      if (!res.ok || data.error) {
        setState("error");
        return;
      }

      const text = data.text ?? "";
      setTranslatedText(text);
      setState("playing");

      const doSpeak = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = SPEECH_LANG[lang] ?? "en-GH";
        const voice = pickVoice(lang);
        if (voice) utterance.voice = voice;
        utterance.onend = () => setState("done");
        utterance.onerror = () => setState("error");
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      };

      doSpeak();
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener(
          "voiceschanged",
          () => doSpeak(),
          { once: true }
        );
      }
    } catch {
      setState("error");
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border-[1.5px] border-border bg-evolucent-off-white p-5 dark:bg-card md:px-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="text-lg" aria-hidden>
          🔊
        </span>
        <span className="font-sans text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground">
          Listen to this project
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {LANGUAGES.map((lang) => {
          const isActive = selectedLang === lang.code;
          const isLoading = isActive && state === "loading";
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageSelect(lang.code)}
              disabled={isLoading}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-4 py-2 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "border-civic-green bg-civic-green-light font-semibold text-civic-green-dark dark:bg-civic-green/15 dark:text-civic-green-light"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/20"
              )}
            >
              {isLoading ? (
                <span
                  className="inline-block size-3 animate-spin rounded-full border-2 border-civic-green border-t-transparent"
                  aria-hidden
                />
              ) : (
                <span className="text-sm" aria-hidden>
                  {lang.flag}
                </span>
              )}
              {lang.label}
              {isActive && state === "playing" ? (
                <span
                  className="ml-0.5 inline-block size-1.5 animate-pulse-live rounded-full bg-civic-green"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {state !== "idle" ? (
        <div
          className={cn(
            "flex items-start justify-between gap-3 rounded-[10px] border px-4 py-3",
            state === "error"
              ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
              : "border-civic-green/30 bg-civic-green-light dark:border-civic-green/30 dark:bg-civic-green/10"
          )}
        >
          <div className="min-w-0 flex-1">
            {state === "loading" ? (
              <p className="m-0 font-sans text-[13px] text-civic-green-dark dark:text-civic-green-light">
                Translating into {selectedLang}…
              </p>
            ) : null}
            {(state === "playing" || state === "done") && translatedText ? (
              <>
                <p className="mb-1.5 m-0 font-sans text-[13px] font-medium text-civic-green-dark dark:text-civic-green-light">
                  {state === "playing"
                    ? `▶ Playing in ${selectedLang}…`
                    : `✓ ${selectedLang} summary`}
                </p>
                <p className="m-0 font-sans text-sm leading-relaxed text-foreground">
                  {translatedText}
                </p>
              </>
            ) : null}
            {state === "error" ? (
              <p className="m-0 font-sans text-[13px] text-[var(--evolucent-red)]">
                Could not translate or read aloud. Check your connection and API
                setup, then try again.
              </p>
            ) : null}
          </div>
          {state === "playing" ? (
            <button
              type="button"
              onClick={stop}
              className="shrink-0 rounded-full border-[1.5px] border-civic-green bg-card px-3.5 py-1.5 font-sans text-xs font-semibold text-civic-green hover:bg-muted"
            >
              ■ Stop
            </button>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 font-sans text-[11px] leading-snug text-muted-foreground">
        AI-assisted translation. Community corrections welcome. Voices vary by
        device — we use the best match available in your browser.
      </p>
    </div>
  );
}
