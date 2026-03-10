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
  handleEmailSignUp,
  handleGoogleLogin,
} from "@/lib/auth/actions/sign-in";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { z } from "zod";

// Add confirmPassword and ensure it matches password
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

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof z.infer<typeof signUpSchema>, string>>
  >({});

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
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

    try {
      setIsSubmitting(true);

      await handleEmailSignUp(parsed.data);

      const encodedEmail = encodeURIComponent(parsed.data.email);
      router.push(`/auth/pending-email-verification?email=${encodedEmail}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const code = err?.code as string | undefined;
      const message = err?.message as string | undefined;

      if (code === "PASSWORD_TOO_SHORT") {
        setFieldErrors((prev) => ({
          ...prev,
          password: "Password too short",
        }));
      } else {
        setFormError(message ?? "Unable to sign up. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Sign up with your email and we&apos;ll send you a verification link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup className="gap-2">
              {/* Name */}
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" name="name" placeholder="John Doe" />
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
                  placeholder="m@example.com"
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

              {/* Form Errors + Buttons */}
              <Field>
                {formError && <FieldError>{formError}</FieldError>}

                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Sign up
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleLogin}
                >
                  Continue with Google
                </Button>

                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href="/auth/sign-in">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
