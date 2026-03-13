"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import googleLogo from "@/images/icons/google.svg";
import { useEmailSignIn, useSocialLogin } from "@/lib/auth/hooks/use-auth";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { authClassNames, AuthContainer } from "./auth-layout";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, { message: "Password required" }),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const emailSignIn = useEmailSignIn();
  const socialLogin = useSocialLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof z.infer<typeof loginSchema>, string>>
  >({});

  function onSubmit() {
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

    emailSignIn.mutate({ ...parsed.data, callbackURL: callbackUrl }, {
      onError: (err: any) => {
        const code = err?.code as string | undefined;
        const message = err?.message as string | undefined;

        if (code === "EMAIL_NOT_VERIFIED") {
          router.push(
            `${routes.auth.pendingEmailVerification()}?email=${encodeURIComponent(
              email,
            )}`,
          );
          return;
        }

        setFormError(message ?? "Unable to login. Please try again.");
      },
    });
  }

  function onGoogleLogin() {
    socialLogin.mutate({ provider: "google", callbackURL: callbackUrl }, {
      onError: () => {
        setFormError("Google login failed. Please try again.");
      },
    });
  }

  const isSubmitting = emailSignIn.isPending;
  const isGoogleLoading = socialLogin.isPending;

  return (
    <AuthContainer>
      <Card className={cn(authClassNames.card)}>
        <CardHeader>
          <CardTitle className={cn(authClassNames.cardTitle)}>Login</CardTitle>
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
                  placeholder="email"
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
                    href={routes.auth.resetPassword()}
                    className="text-muted-foreground ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    placeholder="password"
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
                  disabled={
                    !email.trim() ||
                    !password.trim() ||
                    isSubmitting ||
                    isGoogleLoading
                  }
                >
                  {isSubmitting && <Spinner />}
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={isSubmitting || isGoogleLoading}
                >
                  {isGoogleLoading && <Spinner />}
                  <Image
                    src={googleLogo}
                    alt="Google"
                    width={15}
                    height={15}
                    priority
                  />
                  {isGoogleLoading
                    ? "Redirecting to Google..."
                    : "Login with Google"}
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href={routes.auth.signUp()}>Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </AuthContainer>
  );
}
