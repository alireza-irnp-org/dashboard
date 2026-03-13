import { LoginForm } from "@/app/(auth)/_components/sign-in-form";
import { Suspense } from "react";

export default function Page() {
  return (
    <div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
