import { betterAuth } from "better-auth";
// import Database from "better-sqlite3";
import { PasswordResetEmail } from "@/email-templates/password-reset";
import { VerificationEmail } from "@/email-templates/verification";
import { db } from "@/lib/db/index";
import * as schema from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { expo } from "@better-auth/expo";
import { render } from "@react-email/components";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  // database: new Database("./sqlite.db"),
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: (await render(PasswordResetEmail({ resetUrl: url }))) as string,
      });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, _request) => {
      // Don't await - prevents timing attacks
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: (await render(
          VerificationEmail({ verificationUrl: url }),
        )) as string,
      });
    },
    async afterEmailVerification(user, request) {
      // Your custom logic here, e.g., grant access to premium features
      console.log(`${user.email} has been successfully verified!`);
    },
    sendOnSignUp: true,
    sendOnSignIn: false,
  },
  session: {
    strategy: "jwt", // "compact" or "jwt" or "jwe"
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
    cookieCache: {
      strategy: "jwt",
      enabled: true, // Enable caching session in cookie (default: `false`)
      maxAge: 60 * 60 * 24 * 2, // 2 days
      // refreshCache: true, // Enable stateless refresh
      secure: true,
    },
  },
  socialProviders: {
    //https://www.better-auth.com/docs/authentication/google
    //https://console.cloud.google.com/apis/dashboard
    google: {
      // prompt: "select_account",
      prompt: "select_account consent", 
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline", 
    },
    zoom: { 
      clientId: process.env.ZOOM_CLIENT_ID as string, 
      clientSecret: process.env.ZOOM_CLIENT_SECRET as string, 
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    "myapp://",
    "myapp://*",
    "exp://",
    "exp://**",
  ],
  plugins: [nextCookies(), jwt(), expo()],
});
