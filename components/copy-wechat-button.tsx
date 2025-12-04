"use client";

import { useState } from "react";
import { Button } from "@/components/button";

type Props = {
  text: string;
  label: string;
  successLabel: string;
  failureLabel: string;
  className?: string;
};

export function CopyWechatButton({ text, label, successLabel, failureLabel, className }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(successLabel);
    } catch (error) {
      setMessage(failureLabel);
    } finally {
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div className={className}>
      <Button
        className="w-full justify-center rounded-full bg-foreground text-background hover:bg-foreground/90"
        onClick={handleCopy}
      >
        {label}
      </Button>
      {message && (
        <div className="mt-3 rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-foreground">
          {message}
        </div>
      )}
    </div>
  );
}
