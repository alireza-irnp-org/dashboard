"use client";

import { SuspendFallback } from "@/components/suspend-fallback";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import NextTopLoader from "nextjs-toploader";
import { Suspense } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // For hydration issues, use in specific components causing the issue not globally
  // const [mounted, setMounted] = useState(false);

  // useEffect(() => {
  //   // eslint-disable-next-line react-hooks/set-state-in-effect
  //   setMounted(true);
  // }, []);

  // if (!mounted) {
  //   return <></>;
  // }

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={10}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="var(--primary)" showSpinner={false} />
          <Suspense fallback={<SuspendFallback />}>{children}</Suspense>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
