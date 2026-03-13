"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/lib/constants/routes";

type EmailSignUpParams = {
  name: string;
  email: string;
  password: string;
};

type EmailSignInParams = {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
};

type PasswordResetParams = {
  email: string;
};

type ResendVerificationParams = {
  email: string;
};

type ResetPasswordParams = {
  token: string;
  newPassword: string;
};

type SocialProvider = "google" | "github" | "zoom";

type SocialLoginParams = {
  provider: SocialProvider;
  callbackURL?: string;
};

/** Social login hook */
export function useSocialLogin() {
  return useMutation({
    mutationFn: async ({ provider, callbackURL = routes.dashboard.root() }: SocialLoginParams) => {
      await authClient.signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: "/error",
        newUserCallbackURL: routes.dashboard.root(),
        disableRedirect: false,
      });
    },
  });
}

/** Email sign-up hook */
export function useEmailSignUp() {
  return useMutation({
    mutationFn: async (params: EmailSignUpParams) => {
      const result = await authClient.signUp.email({
        name: params.name,
        email: params.email,
        password: params.password,
        callbackURL: routes.dashboard.root(),
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Email sign-in hook */
export function useEmailSignIn() {
  return useMutation({
    mutationFn: async (params: EmailSignInParams) => {
      const { email, password, rememberMe = true, callbackURL } = params;

      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: callbackURL ?? routes.dashboard.root(),
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Password reset hook */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async ({ email }: PasswordResetParams) => {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: routes.auth.newPassword(),
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Sign-out hook */
export function useSignOut() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      router.push(routes.auth.signIn());
    },
    onError: (error) => {
      console.error("Sign out failed:", error);
    },
  });
}


/** Resend verification email hook */
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: async ({ email }: ResendVerificationParams) => {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: routes.dashboard.root(),
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Resend reset password hook */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: ResetPasswordParams) => {
      const result = await authClient.resetPassword({ token, newPassword });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

type LinkSocialParams = {
  provider: SocialProvider;
  callbackURL?: string;
};

/** Link a social provider to an existing account */
export function useLinkSocial() {
  return useMutation({
    mutationFn: async ({ provider, callbackURL = routes.dashboard.integrations() }: LinkSocialParams) => {
      const result = await authClient.linkSocial({ provider, callbackURL });

      if (result?.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Unlink a social provider from the current account */
export function useUnlinkSocial() {
  return useMutation({
    mutationFn: async (provider: SocialProvider) => {
      const result = await authClient.unlinkAccount({ providerId: provider });

      if (result?.error) {
        throw result.error;
      }

      return result;
    },
  });
}