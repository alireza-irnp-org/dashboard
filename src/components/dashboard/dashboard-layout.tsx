import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarInset, SidebarProvider 
} from "@/components/ui/sidebar";
// } from "@/components/animate-ui/components/radix/sidebar";
import { DasboardHeader } from "./dashboard-header";
import { AssistantModal } from "../assistant-ui/assistant-modal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <DasboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* <div className="bg-blue-100 min-h-[100vh]"></div> */}
          {children}
          {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" /> */}
        </div>
      </SidebarInset>
      <AssistantModal />
    </SidebarProvider>
  );
}
