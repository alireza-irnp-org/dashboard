"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
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

type Status = {
  type: "success" | "error";
  message: string;
};

export function NewPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset() {
    if (!password || !confirmPassword) {
      setStatus({
        type: "error",
        message: "Please fill in both password fields.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      const { error } = await authClient.resetPassword({
        token,
        newPassword: password,
      });

      if (error) {
        throw new Error(error.message || "Unable to reset password.");
      }

      setStatus({
        type: "success",
        message: "Password updated successfully. Redirecting to sign in...",
      });

      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2000);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to reset password.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new password</CardTitle>
        <CardDescription>
          Enter a new password for your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">New Password</FieldLabel>

            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>

            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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
              loading={isLoading}
              disabled={!password || !confirmPassword}
              onClick={handleReset}
            >
              Update password
            </Button>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
