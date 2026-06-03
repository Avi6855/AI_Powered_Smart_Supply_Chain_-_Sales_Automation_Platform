'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center relative overflow-hidden">
      {/* ── Background Orbs ─────────────────────────────────────────────── */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* ── Logo Header ─────────────────────────────────────────────────── */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold font-outfit gradient-text">SupplyChain AI</p>
          <p className="text-xs text-slate-500">Platform v1.0</p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {children}
      </motion.div>
    </div>
  );
}
