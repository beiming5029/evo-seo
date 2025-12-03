"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/container";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            {...fadeIn}
            className="relative group"
          >
            <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-3 opacity-5 group-hover:rotate-6 transition-transform duration-500" />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
              <Image
                src="/images/industrial-robotic-arm.png"
                alt="Industrial Robotic Arm"
                width={800}
                height={600}
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>

          <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-12 tracking-tight">
              赋能制造业企业
            </h2>

            <div className="space-y-8">
              {[
                {
                  title: "透明的数据分析工具",
                  desc: "让每一次流量变化、每一个增长机会都看得清清楚楚。"
                },
                {
                  title: "定制化报告功能",
                  desc: "将复杂数据变成一句话结论，助你快速决策。"
                },
                {
                  title: "客户成功案例证明",
                  desc: "方法有效，结果可见度。"
                },
                {
                  title: "实时效果追踪",
                  desc: "让你的每一分投入都能看见回报。"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-300"
                  whileHover={{ x: 5 }}
                >
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
