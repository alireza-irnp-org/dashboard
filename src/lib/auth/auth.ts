import { betterAuth } from "better-auth";
// import Database from "better-sqlite3";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  // database: new Database("./sqlite.db"),
  // emailAndPassword: {
  //   enabled: true,
  //   // autoSignIn: false //defaults to true
  // },
  socialProviders: {
    //https://www.better-auth.com/docs/authentication/google
    //https://console.cloud.google.com/apis/dashboard
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [nextCookies()],
});
