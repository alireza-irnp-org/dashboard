import { ResetPassword } from "@/app/(auth)/_components/reset-password";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPassword />
      </div>
    </div>
  );
}