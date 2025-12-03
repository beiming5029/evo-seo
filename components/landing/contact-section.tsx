"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/container";
import { MessageCircle, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MessageSquare } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

export function ContactSection() {
  return (
    <section id="contact" className="pt-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
      <Container>
        <motion.div {...fadeIn}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">联系我们</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-lg">
              有任何问题？我们的专家团队随时准备为您提供帮助。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-colors duration-300 group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">咨询微信</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">LSHY_LEE</div>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                添加微信，直接与我们的 SEO 专家沟通，获取定制化方案。
              </p>
            </div>

            {/* <div className="bg-slate-900 dark:bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden group border border-slate-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/30 transition-colors duration-500" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">需要更多帮助？</h3>
                  <p className="text-slate-400">查看我们的帮助中心或发送邮件。</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-blue-400 font-semibold group-hover:text-blue-300 transition-colors cursor-pointer">
                  访问帮助中心 <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div> */}
          </div>
        </motion.div>
      </Container>

      {/* Dark Footer Bar */}
      <div className="mt-32 bg-[#1A1D21] dark:bg-black py-6 border-t border-slate-800">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">AI</div>
              <span className="text-white font-semibold text-lg">evoSEO</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <span>版权所有 © 2025 evo SEO& Sistine Labs</span>
              <div className="flex gap-6">
                <a href="#" className="hover:text-white transition-colors">隐私政策</a>
                <a href="#" className="hover:text-white transition-colors">使用条款</a>
              </div>
            </div>

            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
