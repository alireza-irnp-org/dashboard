import { betterAuth } from "better-auth";
// import Database from "better-sqlite3";
import { db } from "@/lib/db/index";
import * as schema from "@/lib/db/schema";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  // database: new Database("./sqlite.db"),
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    schema,
  }),
  // emailAndPassword: {
  //   enabled: true,
  //   // autoSignIn: false //defaults to true
  // },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24h
    cookieCache: {
      enabled: true, // Enable caching session in cookie (default: `false`)
      maxAge: 60 * 60 * 24 * 2, // 2 days
    },
  },
  socialProviders: {
    //https://www.better-auth.com/docs/authentication/google
    //https://console.cloud.google.com/apis/dashboard
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  plugins: [nextCookies()],
});
