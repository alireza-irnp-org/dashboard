"use client";

// import ENVConfig from "@/../config";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger 
} from "@/components/ui/sidebar";
// } from "@/components/animate-ui/components/radix/sidebar";
import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { BreadcrumbDemo } from "./header-breadcrumbs";
import { HeaderUserDropdown } from "./header-user";
import { NavUserType } from "./nav-user";
import { cn } from "@/lib/utils";
// import { CommandMenu } from "./command-menu";
import { authClient } from "@/lib/auth/auth-client";

export function DasboardHeader() {
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  const user: NavUserType = {
    name: session?.user.name || "",
    email: session?.user.email || "",
    avatar: session?.user.image || "avatar",
  };

  return (
    // <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
    <header
      className={cn(
        "bg-background/60 sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b shadow-xs backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
      )}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 my-auto data-[orientation=vertical]:h-[calc(var(--header-height)/1.5)]"
        />
        <BreadcrumbDemo />
        {/* <CommandMenu /> */}
        {/* <h1 className="text-base font-medium">{<BreadcrumbConsumer />}</h1> */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <Link
              href=""
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              Home
            </Link>
          </Button>
          <ThemeToggle />
          <HeaderUserDropdown user={user} />
        </div>
      </div>
    </header>
  );
}
