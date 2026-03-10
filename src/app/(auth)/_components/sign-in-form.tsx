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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  handleEmailSignIn,
  handleGoogleLogin,
} from "@/lib/auth/actions/sign-in";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>

                <Input
                  id="email"
                  name="email"
                  // type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {fieldErrors.email && (
                  <FieldError>{fieldErrors.email}</FieldError>
                )}
              </Field>

              {/* Password */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>

                  <Link
                    href="/auth/reset-password"
                    className="text-muted-foreground ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
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

                {fieldErrors.password && (
                  <FieldError>{fieldErrors.password}</FieldError>
                )}
              </Field>

              {/* Form Errors + Buttons */}
              <Field>
                {formError && <FieldError>{formError}</FieldError>}

                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={
                    !email.trim() ||
                    !password.trim() ||
                    isSubmitting ||
                    isGoogleLoading
                  }
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
