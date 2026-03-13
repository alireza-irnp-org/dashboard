"use client";

import * as React from "react";

import { NavMenu } from "@/components/dashboard/nav-menu";
import { TeamSwitcher } from "@/components/dashboard/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { teamSwitcherExample } from "@/lib/constants/team-switcher-items";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamSwitcherExample} />
      </SidebarHeader>
      <SidebarContent>
        <NavMenu />
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
