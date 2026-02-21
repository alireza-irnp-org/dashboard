import { TeamSwitcherType } from "@/components/dashboard/team-switcher";
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
} from "lucide-react";

export const teamSwitcherExample: TeamSwitcherType[] = [
  {
    name: "Acme Inc",
    logo: <GalleryVerticalEndIcon />,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: <AudioLinesIcon />,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: <TerminalIcon />,
    plan: "Free",
  },
];
