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
import {
  handleEmailSignIn,
  handleGoogleLogin,
} from "@/lib/auth/actions/sign-in";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, { message: "Password required" }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof z.infer<typeof loginSchema>, string>>
  >({});

  async function onSubmit() {
    setFormError(null);
    setFieldErrors({});

    const values = { email, password };

    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      const errors: Partial<Record<keyof typeof values, string>> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof typeof values;
        errors[path] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);

      await handleEmailSignIn(parsed.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const code = err?.code as string | undefined;
      const message = err?.message as string | undefined;

      if (code === "EMAIL_NOT_VERIFIED") {
        router.push(
          `/auth/pending-email-verification?email=${encodeURIComponent(email)}`,
        );
        return;
      }

      if (code === "PASSWORD_TOO_SHORT") {
        setFieldErrors((prev) => ({
          ...prev,
          password: "Password too short",
        }));
      } else {
        setFormError(message ?? "Unable to login. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onGoogleLogin() {
    try {
      setIsGoogleLoading(true);
      await handleGoogleLogin();
    } catch (err) {
      setFormError("Google login failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  // required
                />

                {fieldErrors.email && (
                  <FieldDescription className="text-red-500">
                    {fieldErrors.email}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>

                  <Link
                    href="/auth/reset-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  // required
                />

                {fieldErrors.password && (
                  <FieldDescription className="text-red-500">
                    {fieldErrors.password}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                {formError && (
                  <FieldDescription className="text-red-500">
                    {formError}
                  </FieldDescription>
                )}

                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting || isGoogleLoading}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  onClick={onGoogleLogin}
                  loading={isGoogleLoading}
                  disabled={isSubmitting || isGoogleLoading}
                >
                  {isGoogleLoading
                    ? "Redirecting to Google..."
                    : "Login with Google"}
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
