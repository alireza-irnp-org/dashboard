import { NavMainItemType } from "@/components/dashboard/nav-main";
import {
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  Plug2Icon,
  UserCircleIcon,
} from "lucide-react";

export const navMainExample: NavMainItemType[] = [
  {
    title: "Playground",
    url: "#",
    icon: <TerminalSquareIcon />,
    isActive: true,
    items: [
      {
        title: "Chat",
        url: "/chat",
      },
      {
        title: "History",
        url: "#",
      },
      {
        title: "Starred",
        url: "#",
      },
      {
        title: "Settings",
        url: "#",
      },
    ],
  },
  {
    title: "Models",
    url: "#",
    icon: <BotIcon />,
    items: [
      {
        title: "Genesis",
        url: "#",
      },
      {
        title: "Explorer",
        url: "#",
      },
      {
        title: "Quantum",
        url: "#",
      },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: <BookOpenIcon />,
    items: [
      {
        title: "Introduction",
        url: "#",
      },
      {
        title: "Get Started",
        url: "#",
      },
      {
        title: "Tutorials",
        url: "#",
      },
      {
        title: "Changelog",
        url: "#",
      },
    ],
  },
  {
    title: "Settings",
    url: "#",
    icon: <Settings2Icon />,
    items: [
      {
        title: "General",
        url: "#",
      },
      {
        title: "Team",
        url: "#",
      },
      {
        title: "Billing",
        url: "#",
      },
      {
        title: "Limits",
        url: "#",
      },
    ],
  },
  {
    title: "Integrations",
    url: "/dashboard/integrations",
    icon: <Plug2Icon />,
    items: [],
  },
  {
    title: "Account",
    url: "/dashboard/account",
    icon: <UserCircleIcon />,
    items: [],
  },
];
