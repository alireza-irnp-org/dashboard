/**
 * Password Reset Email Template
 *
 * Sent when users request to reset their password.
 * Used with better-auth or any authentication system.
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  /** URL to reset the password */
  resetUrl: string;
  /** How long until the link expires */
  expiresIn?: string;
}

export function PasswordResetEmail({
  resetUrl,
  expiresIn = "1 hour",
}: PasswordResetEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your password</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl px-4 py-12">
            <Text className="text-2xl font-bold text-black">Acme</Text>

            <Heading className="mt-8 text-2xl font-bold text-gray-900">
              Reset your password
            </Heading>

            <Text className="text-base leading-6 text-gray-700">
              We received a request to reset your password. Click the button
              below to choose a new password.
            </Text>

            <Button
              href={resetUrl}
              className="mt-4 box-border inline-block rounded-md bg-black px-6 py-3 font-medium text-white"
            >
              Reset Password
            </Button>

            <Text className="mt-4 text-sm text-gray-500">
              This link will expire in {expiresIn}.
            </Text>

            <Hr className="my-8 border-gray-200" />

            <Text className="text-sm text-gray-500">
              If you didn&apos;t request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </Text>

            {/* Security notice */}
            <div className="mt-6 rounded-md border border-solid border-yellow-200 bg-yellow-50 p-4">
              <Text className="m-0 text-sm text-yellow-800">
                <strong>Security tip:</strong> Never share this link with
                anyone. Acme will never ask for your password via email.
              </Text>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

PasswordResetEmail.PreviewProps = {
  resetUrl: "https://example.com/reset-password?token=abc123xyz",
  expiresIn: "1 hour",
} satisfies PasswordResetEmailProps;

export default PasswordResetEmail;
