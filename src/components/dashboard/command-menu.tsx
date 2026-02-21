"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
// import {
//   MainDashboarOrgs,
//   MainDashboarProjects,
//   MainIntegrations,
//   MainSettings,
//   MainSettingsAccount,
//   MainSettingsAppearance,
// } from "@/routes";
import {
  Blocks,
  Building,
  Folder,
  Home,
  Palette,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const toggleOpen = React.useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((open) => !open);
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("keydown", toggleOpen);
    return () => document.removeEventListener("keydown", toggleOpen);
  }, [toggleOpen]);

  const commandGroups = {
    navigation: [
      {
        label: "Home",
        icon: Home,
        href: "/" + "MainDashboarProjects()",
        shortcut: "H",
      },
    ],
    settings: [
      {
        label: "Profile",
        icon: User,
        href: "/" + "MainSettings()",
        shortcut: "P",
      },
      {
        label: "Settings",
        icon: Settings,
        href: "/" + "MainSettings()",
        shortcut: "S",
      },
      {
        label: "Appearance",
        icon: Palette,
        href: "/" + "MainSettingsAppearance()",
        shortcut: "A",
      },
    ],
    integrations: [
      {
        label: "Integrations",
        icon: Blocks,
        href: "/" + "MainIntegrations()",
        shortcut: "I",
      },
    ],
    organizations: [
      {
        label: "Organizations",
        icon: Building,
        href: "/" + "MainDashboarOrgs()",
        shortcut: "O",
      },
      {
        label: "Projects",
        icon: Folder,
        href: "/" + "MainDashboarProjects()",
        shortcut: "O",
      },
    ],
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() =>
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
          )
        }
        className="hover:bg-muted flex min-w-[200px] cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
      >
        <Search className="text-muted-foreground h-4 w-4" />
        <span className="text-muted-foreground">Search...</span>
        <kbd className="text-muted-foreground bg-muted ml-auto rounded px-1.5 py-0.5 text-xs">
          ⌘K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(commandGroups).map(([groupName, items]) => (
            <CommandGroup key={groupName} heading={groupName}>
              {items.map((page, index) => (
                <CommandItem
                  className="h-[30px] text-sm"
                  key={index}
                  onSelect={() => {
                    router.push(page.href);
                    setOpen(false);
                  }}
                >
                  <page.icon className="mr-2 h-3 w-3" />
                  <span>{page.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
