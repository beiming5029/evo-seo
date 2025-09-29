"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/button";

export function NewsletterForm() {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Successfully subscribed!");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to subscribe");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-black dark:text-white mb-4">
        {t('footer.newsletter.title')}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        {t('footer.newsletter.description')}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('footer.newsletter.placeholder')}
            className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:ring-offset-2"
            disabled={status === "loading" || status === "success"}
            required
          />
          <Button
            type="submit"
            variant="simple"
            className="px-4 py-2 text-sm"
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? t('common.loading') : t('footer.newsletter.subscribe')}
          </Button>
        </div>
        
        {message && (
          <p className={`text-xs ${
            status === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}