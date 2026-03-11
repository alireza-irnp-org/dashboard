"use client";

import React, { ReactNode } from "react";
import { AuthLayout } from "../_components/auth-layout";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <AuthLayout>{children}</AuthLayout>;
}
