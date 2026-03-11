"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export default function AuthCard({ children, className = "" }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // smooth "app-like" easing
      }}
    >
      <Card
        className={`dark:bg-card/50 border-ring/20 border shadow-lg backdrop-blur-2xl ${className}`}
      >
        {children}
      </Card>
    </motion.div>
  );
}
