"use client";

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
import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Status = {
  type: "success" | "error";
  message: string;
};

export function PendingEmailVerification() {
  const searchParams = useSearchParams();
  const pendingEmail = searchParams?.get("email") ?? "";

  const [email, setEmail] = useState(pendingEmail);
  const [status, setStatus] = useState<Status | null>(null);
  const [isSending, setIsSending] = useState(false);

  const descriptionEmail = email.trim() || pendingEmail || "your inbox";

  async function handleResend() {
    if (!email.trim()) {
      setStatus({
        type: "error",
        message: "Enter your email address to resend the verification link.",
      });
      return;
    }

    setIsSending(true);
    setStatus(null);

    try {
      const { error } = await authClient.sendVerificationEmail({
        email: email.trim(),
        callbackURL: "/dashboard",
      });

      if (error) {
        throw new Error(
          error.message || "Unable to resend the verification email.",
        );
      }

      setStatus({
        type: "success",
        message:
          "A fresh verification link has been sent. Please check your inbox.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to resend the verification email.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We sent a verification link to <strong>{descriptionEmail}</strong>.
          Click it to finish creating your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="pending-email">Email</FieldLabel>

            <Input
              id="pending-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <FieldDescription>
              Didn&apos;t receive the email? You can resend it below.
            </FieldDescription>
          </Field>

          {status && (
            <FieldDescription
              role="status"
              aria-live="polite"
              className={
                status.type === "error" ? "text-destructive" : "text-green-500"
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
              onClick={handleResend}
            >
              Resend verification email
            </Button>

            <FieldDescription className="text-center">
              Already verified?{" "}
              <Link
                href="/auth/sign-in"
                className="text-primary underline-offset-4 hover:underline"
              >
                Return to sign in
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
