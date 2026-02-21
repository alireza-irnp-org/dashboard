"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export function useSignOut() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth/sign-in");
  };

  return handleSignOut;
}
