"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { authClassNames, AuthContainer } from "./auth-layout";
import { routes } from "@/lib/constants/routes";

type Status = {
  type: "success" | "error";
  message: string;
};

export function ResetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      setStatus({
        type: "error",
        message: "Please enter your email address.",
      });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const { error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/auth/new-password",
      });

      if (error) {
        throw new Error(
          error.message || "Unable to send password reset email.",
        );
      }

      setStatus({
        type: "success",
        message: "Password reset link sent. Please check your inbox.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to send password reset email.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <AuthContainer>
      <Card className={cn(authClassNames.card)}>
        <CardHeader>
          <CardTitle className={cn(authClassNames.cardTitle)}>
            Reset your password
          </CardTitle>
          <CardDescription>
            Enter your email address and we’ll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>

              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <FieldDescription>
                We&apos;ll email you a secure password reset link.
              </FieldDescription>
            </Field>

            {status && (
              <FieldDescription
                role="status"
                aria-live="polite"
                className={
                  status.type === "error"
                    ? "text-destructive"
                    : "text-green-500"
                }
              >
                {status.message}
              </FieldDescription>
            )}

            <Field>
              <Button
                type="button"
                loading={isSending}
                disabled={!email.trim()}
                onClick={handleReset}
              >
                Send reset link
              </Button>

              <FieldDescription className="text-center">
                Remember your password?{" "}
                <Link
                  href={routes.auth.signIn()}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Back to sign in
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </AuthContainer>
  );
}
