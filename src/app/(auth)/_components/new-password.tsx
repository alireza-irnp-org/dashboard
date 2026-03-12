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

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { authClassNames, AuthContainer } from "./auth-layout";

type Status = {
  type: "success" | "error";
  message: string;
};

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password too long.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function NewPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [status, setStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset() {
    setStatus(null);

    const validation = passwordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!validation.success) {
      const error = validation.error.issues[0];
      setStatus({
        type: "error",
        message: error.message,
      });
      return;
    }

    setIsLoading(true);

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
    <AuthContainer>
      <Card className={cn(authClassNames.card)}>
        <CardHeader>
          <CardTitle className={cn(authClassNames.cardTitle)}>
            Create a new password
          </CardTitle>
          <CardDescription>
            Enter a new password for your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>

              <div className="relative">
                <Input
                  id="password"
                  placeholder="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />

                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-auto -translate-y-1/2 p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>

              <div className="relative">
                <Input
                  id="confirm-password"
                  placeholder="confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />

                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 h-auto -translate-y-1/2 p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </Button>
              </div>
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
                disabled={!password || !confirmPassword}
                onClick={handleReset}
              >
                {isLoading && <Spinner />}
                Update password
              </Button>

              <FieldDescription className="text-center">
                <Link href={routes.auth.signIn()}>Back to sign in</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </AuthContainer>
  );
}
