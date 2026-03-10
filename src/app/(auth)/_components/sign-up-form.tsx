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
  handleEmailSignUp,
  handleGoogleLogin,
} from "@/lib/auth/actions/sign-in";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { z } from "zod";

const signUpSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name is too long" }),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, { message: "Password too short" })
    .max(128, { message: "Password too long" }),
});

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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
      // Better Auth will send a verification email; the user should check inbox.
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
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" name="name" placeholder="John Doe" required />
                {fieldErrors.name ? (
                  <FieldDescription className="text-red-500">
                    {fieldErrors.name}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  autoComplete="email"
                />
                {fieldErrors.email ? (
                  <FieldDescription className="text-red-500">
                    {fieldErrors.email}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
                {fieldErrors.password ? (
                  <FieldDescription className="text-red-500">
                    {fieldErrors.password}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                {formError ? (
                  <FieldDescription className="text-red-500">
                    {formError}
                  </FieldDescription>
                ) : null}
                <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
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
