"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/lib/auth/actions/sign-out";
import {
  SparklesIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  BellIcon,
  LogOutIcon,
} from "lucide-react";

export interface NavUserType {
  name: string;
  email: string;
  avatar: string;
}

export function HeaderUserDropdown({ user }: { user: NavUserType }) {
  const signOut = useSignOut();

  const userInitials = user.name
    ?.trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="cursor-pointer transition-opacity duration-200 hover:opacity-50 data-[state=open]:opacity-50"
      >
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={10}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <SparklesIcon className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheckIcon className="mr-2 h-4 w-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCardIcon className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon className="mr-2 h-4 w-4" />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={signOut}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
