export const routes = {
  dashboard: {
    root: () => "/dashboard",
    integrations: () => "/dashboard/integrations",
    account: () => "/dashboard/account",
  },
  authParent: () => "/auth",
  auth: {
    signIn: () => "/auth/sign-in",
    signUp: () => "/auth/sign-up",
    pendingEmailVerification: () => "/auth/pending-email-verification",
    resetPassword: () => "/auth/reset-password",
    newPassword: () => "/auth/new-password",
  },
};
