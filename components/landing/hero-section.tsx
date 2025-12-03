"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/container";
import Image from "next/image";
import { Button } from "@/components/button";
import { ArrowRight, BarChart2, Globe, Search, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/factory-background.png"
          alt="Factory Background"
          fill
          className="object-cover opacity-20"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/50 to-white/90 backdrop-blur-[1px] dark:from-slate-950/90 dark:via-slate-950/50 dark:to-slate-950/90" />
        {/* Noise Texture */}
        <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
      </div>

      {/* Floating Elements - Left */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute left-[5%] top-[30%] hidden lg:block z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-800/50 w-64 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Organic Traffic</div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">+128%</div>
            </div>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-[70%]" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="absolute left-[10%] bottom-[25%] hidden lg:block z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-800/50 w-56 transform rotate-3 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Global Rank</div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">#1 Position</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements - Right */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute right-[5%] top-[35%] hidden lg:block z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-800/50 w-64 transform rotate-6 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">AI Optimization</div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Active</div>
            </div>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-1 flex-1 bg-purple-500 rounded-full opacity-80" />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute right-[12%] bottom-[30%] hidden lg:block z-10"
      >
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 dark:border-slate-800/50 w-52 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Keywords Found</div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">2,450+</div>
            </div>
          </div>
        </div>
      </motion.div>

      <Container className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span className="py-1.5 px-4 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs md:text-sm font-semibold tracking-wider uppercase shadow-sm">
              DISCOVER OUR SERVICES
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-slate-50 tracking-tight mb-8 leading-[1.1]">
            AI SEO<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              SOLUTIONS
            </span>
          </h1>

          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-10 rounded-full" />

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed text-balance mb-12">
            探索我们<span className="font-bold text-slate-900 dark:text-slate-50">专业且结果导向</span>的SEO服务，帮助制造业企业提升在线影响力，实现可衡量的业务增长。
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex justify-center gap-4"
          >
            <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1" as="a" href="/login">
              立即开始
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Trusted By Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-20 pt-10 border-t border-slate-200/60"
          >
            <p className="text-sm text-slate-400 font-medium mb-6 uppercase tracking-widest">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholder Logos - Replace with real SVGs if available */}
              {['Acme Corp', 'Global Tech', 'Future Systems', 'Blue Sky', 'Innovate'].map((company) => (
                <span key={company} className="text-xl font-bold text-slate-800 dark:text-slate-200">{company}</span>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </Container>
    </section>
  );
}
