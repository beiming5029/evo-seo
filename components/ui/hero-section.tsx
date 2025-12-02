"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";

export const HeroSection = ({
  children,
  className,
  title,
  subtitle,
  badge,
  cta,
}: {
  children?: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  cta?: React.ReactNode;
}) => {
  return (
    <AuroraBackground className={cn("h-[50rem]", className)}>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.1,
          duration: 0.4,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4"
      >
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {badge && <div className="mb-6">{badge}</div>}
          <div className="text-4xl md:text-7xl font-bold text-center dark:text-white text-slate-900">
            {title}
          </div>
          <div className="mt-4 font-normal text-base md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl text-center mx-auto leading-relaxed">
            {subtitle}
          </div>
          {cta && <div className="mt-8">{cta}</div>}
        </div>
        {children}
      </motion.div>
    </AuroraBackground>
  );
};
