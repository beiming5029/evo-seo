"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/container";
import { Button } from "@/components/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

export function CTASection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <Container>
        <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 dark:bg-slate-900 shadow-2xl border border-slate-800">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-40">
            <Image
              src="/images/aerial-warehouse-storage.png"
              alt="Background"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
          </div>

          {/* Content */}
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center p-8 md:p-16">
            <motion.div
              {...fadeIn}
              className="text-white"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                开始提升您的<br/>
                <span className="text-blue-400">SEO 效果</span>
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-md">
                加入 500+ 企业客户，AI+专家团队护航增长。立即开启您的增长之旅。
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-blue-900/50 transition-all hover:scale-105" as="a" href="/login">
                  立即开始
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block relative h-full min-h-[300px]"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl" />
              <div className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
