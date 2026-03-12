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

import { useEmailSignUp, useSocialLogin } from "@/lib/auth/hooks/use-auth";

import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SubmitEvent, useState } from "react";
import { z } from "zod";

import { authClassNames, AuthContainer } from "./auth-layout";

const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Name is required" })
      .max(100, { message: "Name is too long" }),

    email: z.email("Invalid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password too long.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),

    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function SignUpForm() {
  const router = useRouter();

  const emailSignUp = useEmailSignUp();
  const socialLogin = useSocialLogin();

  const [formError, setFormError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof z.infer<typeof signUpSchema>, string>>
  >({});

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);

    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const parsed = signUpSchema.safeParse(values);

    if (!parsed.success) {
      const errors: Partial<Record<keyof typeof values, string>> = {};

      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof typeof values;
        errors[path] = issue.message;
      }

      setFieldErrors(errors);
      return;
    }

    emailSignUp.mutate(
      {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
      {
        onSuccess: () => {
          const encodedEmail = encodeURIComponent(parsed.data.email);
    
          router.push(
            `${routes.auth.pendingEmailVerification()}?email=${encodedEmail}`
          );
        },
        onError: (err: any) => {
          const code = err?.code as string | undefined;
          const message = err?.message as string | undefined;
    
          setFormError(message ?? "Unable to sign up. Please try again.");
        },
      }
    );
  }

  async function onGoogleLogin() {
    socialLogin.mutate("google", {
      onError: () => {
        setFormError("Google login failed. Please try again.");
      },
    });
  }

  return (
    <AuthContainer>
      <Card className={cn(authClassNames.card)}>
        <CardHeader>
          <CardTitle className={cn(authClassNames.cardTitle)}>
            Create an account
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup className="gap-3">
              {/* Name */}
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>

                <Input id="name" name="name" placeholder="name" />

                {fieldErrors.name && (
                  <FieldError>{fieldErrors.name}</FieldError>
                )}
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>

                <Input
                  id="email"
                  name="email"
                  placeholder="email"
                  autoComplete="email"
                />

                {fieldErrors.email && (
                  <FieldError>{fieldErrors.email}</FieldError>
                )}
              </Field>

              {/* Password */}
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    placeholder="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                  />

                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-3 h-auto -translate-y-1/2 p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>

                {fieldErrors.password && (
                  <FieldError>{fieldErrors.password}</FieldError>
                )}
              </Field>

              {/* Confirm Password */}
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>

                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="confirm password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                  />

                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute top-1/2 right-3 h-auto -translate-y-1/2 p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </Button>
                </div>

                {fieldErrors.confirmPassword && (
                  <FieldError>{fieldErrors.confirmPassword}</FieldError>
                )}
              </Field>

              {/* Form Errors */}
              {formError && (
                <Field>
                  <FieldError>{formError}</FieldError>
                </Field>
              )}

              {/* Submit */}
              <Field>
                <Button type="submit" disabled={emailSignUp.isPending}>
                  {emailSignUp.isPending && <Spinner />}
                  Sign up
                </Button>

                {/* Google login */}
                <Button
                  variant="outline"
                  type="button"
                  onClick={onGoogleLogin}
                  disabled={socialLogin.isPending}
                >
                  {socialLogin.isPending && <Spinner />}
                  <Image
                    src={googleLogo}
                    alt="Google"
                    width={15}
                    height={15}
                    priority
                  />
                  Continue with Google
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href={routes.auth.signIn()}>Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </AuthContainer>
  );
}
