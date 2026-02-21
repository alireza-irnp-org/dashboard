import { NavProjectsItemType } from "@/components/dashboard/nav-projects";
import { FrameIcon, PieChartIcon, MapIcon } from "lucide-react";

export const navProjectsExample: NavProjectsItemType[] = [
  {
    name: "Design Engineering",
    url: "#",
    icon: <FrameIcon />,
  },
  {
    name: "Sales & Marketing",
    url: "#",
    icon: <PieChartIcon />,
  },
  {
    name: "Travel",
    url: "#",
    icon: <MapIcon />,
  },
];
