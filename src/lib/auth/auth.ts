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
import { jwt, openAPI, bearer } from "better-auth/plugins";


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
    // expiresIn: 60 * 60 * 24 * 7, // 7 days
    // updateAge: 60 * 60 * 24, // refresh every 24h
    expiresIn: 60 * 60 * 24 * 2, // 1 day for testing
    updateAge: 60 * 60 * 24 * 1, // refresh every 10 seconds for testing
    cookieCache: {
      strategy: "jwt", // "compact" or "jwt" or "jwe"
      enabled: true, // Enable caching session in cookie (default: `false`)
      // maxAge: 60 * 60 * 24 * 2, // 2 days (session in coockie without revalidation with database)
      maxAge: 10 * 60, // 30 seconds for testing
      // refreshCache: true, // Refresh cookie cache when session is updated via updateAge
    },
  },
  socialProviders: {
    //https://www.better-auth.com/docs/authentication/google
    //https://console.cloud.google.com/apis/dashboard
    google: {
      prompt: "select_account",
      // prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // accessType: "offline",
    },
    zoom: {
      clientId: process.env.ZOOM_CLIENT_ID as string,
      clientSecret: process.env.ZOOM_CLIENT_SECRET as string,
    },
  },
  account: {
    // modelName: "accounts",
    // fields: {
    //   userId: "user_id"
    // },
    encryptOAuthTokens: true, // Encrypt OAuth tokens before storing them in the database
    storeAccountCookie: false, // Store account data after OAuth flow in a cookie (useful for database-less flows)
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "zoom", "email-password"], // or async (request) => ["google", "github"]
      allowDifferentEmails: true
    }
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL!,
    "myapp://",
    "myapp://*",
    "exp://",
    "exp://**",
  ],
  advanced: {
    // useSecureCookies: true
  },
  plugins: [nextCookies(), jwt(), bearer(), openAPI(), expo()],
});

// http://localhost:3000/api/auth/reference