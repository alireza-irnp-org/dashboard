"use client";

import granientBackground from "@/images/grainient.png";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export const authClassNames = {
  card: "dark:bg-card/50 shadow-lg backdrop-blur-2xl",
  cardTitle: "text-center text-lg",
};

export function AuthContainer({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Dark theme background */}
      <div
        className="absolute inset-0 -z-10 hidden bg-cover bg-center bg-no-repeat dark:block"
        style={{
          backgroundImage: `url(${granientBackground.src})`,
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 -z-10 hidden bg-black/70 dark:block" />

      {/* Page Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
