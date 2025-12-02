"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 bg-neutral-950 overflow-hidden",
        className
      )}
    >
      <div className="absolute h-full w-full inset-0 bg-neutral-950 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 h-full w-full"
      >
        <div className="absolute h-[100%] w-full inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-[0.80] bg-red-500 opacity-20 blur-3xl" />
        <div className="absolute h-full w-full inset-0 bg-neutral-950 opacity-90" />
        <div className="absolute h-full w-full inset-0 overflow-hidden">
          <Beams />
        </div>
      </motion.div>
    </div>
  );
};

const Beams = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 696 316"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 left-0 w-full h-full"
    >
      <path
        opacity="0.2"
        d="M34 316V0"
        stroke="url(#paint0_linear_beams)"
        strokeWidth="1"
      />
      <path
        opacity="0.2"
        d="M100 316V0"
        stroke="url(#paint1_linear_beams)"
        strokeWidth="1"
      />
      <path
        opacity="0.2"
        d="M166 316V0"
        stroke="url(#paint2_linear_beams)"
        strokeWidth="1"
      />
      <path
        opacity="0.2"
        d="M232 316V0"
        stroke="url(#paint3_linear_beams)"
        strokeWidth="1"
      />
      <path
        opacity="0.2"
        d="M298 316V0"
        stroke="url(#paint4_linear_beams)"
        strokeWidth="1"
      />
      <path
        opacity="0.2"
        d="M364 316V0"
        stroke="url(#paint5_linear_beams)"
        strokeWidth="1"
      />
      <path
        opacity="0.2"
        d="M430 316V0"
        stroke="url(#paint6_linear_beams)"
        strokeWidth="1"
      />
      <path
        opacity="0.2"
        d="M496 316V0"
        stroke="url(#paint7_linear_beams)"
        strokeWidth="1"
      />
      <path
        opacity="0.2"
        d="M562 316V0"
        stroke="url(#paint8_linear_beams)"
        strokeWidth="1"
      />
      <path
        opacity="0.2"
        d="M628 316V0"
        stroke="url(#paint9_linear_beams)"
        strokeWidth="1"
      />
      <defs>
        <linearGradient
          id="paint0_linear_beams"
          x1="34.5"
          y1="0"
          x2="34.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_beams"
          x1="100.5"
          y1="0"
          x2="100.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_beams"
          x1="166.5"
          y1="0"
          x2="166.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_beams"
          x1="232.5"
          y1="0"
          x2="232.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_beams"
          x1="298.5"
          y1="0"
          x2="298.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_beams"
          x1="364.5"
          y1="0"
          x2="364.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_beams"
          x1="430.5"
          y1="0"
          x2="430.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint7_linear_beams"
          x1="496.5"
          y1="0"
          x2="496.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint8_linear_beams"
          x1="562.5"
          y1="0"
          x2="562.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint9_linear_beams"
          x1="628.5"
          y1="0"
          x2="628.5"
          y2="316"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A78BFA" stopOpacity="0" />
          <stop offset="0.5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#A78BFA" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
