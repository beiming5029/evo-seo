"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function NewsletterInline() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      await response.json();

      if (response.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
      <span>{t('footer.newsletter.title')}</span>
      <div className="inline-flex items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('footer.newsletter.placeholder')}
          className={cn(
            "px-3 py-1",
            "bg-transparent",
            "border-b border-neutral-300 dark:border-neutral-700",
            "text-sm text-neutral-900 dark:text-white",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
            "focus:outline-none focus:border-neutral-900 dark:focus:border-white",
            "transition-colors duration-200",
            "w-48",
            status === "success" && "border-green-500 dark:border-green-400",
            status === "error" && "border-red-500 dark:border-red-400"
          )}
          disabled={status === "loading" || status === "success"}
          required
        />
        <button
          type="submit"
          className={cn(
            "ml-2 px-3 py-1",
            "text-sm font-medium",
            "text-neutral-900 dark:text-white",
            "hover:text-black dark:hover:text-neutral-200",
            "transition-colors duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? "..." : status === "success" ? "✓" : "→"}
        </button>
      </div>
      {status === "success" && (
        <span className="text-xs text-green-600 dark:text-green-400">
          {t('common.success')}
        </span>
      )}
    </form>
  );
}