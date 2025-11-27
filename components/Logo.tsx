"use client";
import Link from "next/link";
import React from "react";

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm mr-4 text-foreground px-2 py-1 relative z-20"
    >
      <div className="h-6 w-6 rounded-lg bg-foreground flex items-center justify-center text-xs font-bold text-background">
        E
      </div>
      <span className="font-semibold text-foreground">evoSEO</span>
    </Link>
  );
};
