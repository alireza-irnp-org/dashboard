"use client";

import * as React from "react";

import { NavMain } from "@/components/dashboard/nav-main";
// import { NavProjects } from "@/components/dashboard/nav-projects";
import { TeamSwitcher } from "@/components/dashboard/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navMainExample } from "@/lib/constants/nav-main-items";
// import { navProjectsExample } from "@/lib/constants/nav-projects-items";
import { teamSwitcherExample } from "@/lib/constants/team-switcher-items";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teamSwitcherExample} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainExample} />
        {/* <NavProjects projects={navProjectsExample} /> */}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
