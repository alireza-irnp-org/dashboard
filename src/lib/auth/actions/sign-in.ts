import { authClient } from "@/lib/auth/auth-client"; //import the auth client

export const handleGoogleLogin = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
    errorCallbackURL: "/error",
    newUserCallbackURL: "/dashboard",
    disableRedirect: false,
  });
};

export const handleEmailSignUp = async (params: {
  name: string;
  email: string;
  password: string;
}) => {
  const { name, email, password } = params;

  const result = await authClient.signUp.email({
    name,
    email,
    password,
    callbackURL: "/dashboard",
  });

  if (result.error) {
    throw result.error;
  }

  return result;
};

export const handleEmailSignIn = async (params: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) => {
  const { email, password, rememberMe = true } = params;

  const result = await authClient.signIn.email(
    {
      email,
      password,
      rememberMe,
      callbackURL: "/dashboard",
    },
    // {
    //   onError: (ctx) => {
    //     // Handle the error
    //     if (ctx.error.status === 403) {
    //       alert("Please verify your email address");
    //     }
    //     //you can also show the original error message
    //     alert(ctx.error.message);
    //   },
    // },
  );

  if (result.error) {
    throw result.error;
  }

  return result;
};
