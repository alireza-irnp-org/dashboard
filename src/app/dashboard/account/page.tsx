import { ZoomCard } from "@/app/dashboard/integrations/_components/zoom-card";
import { routes } from "@/lib/constants/routes";
import { Link2 } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account settings and connected services.
        </p>
      </div>

      {/* Connected Integrations section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium">Connected integrations</h2>
            <p className="text-muted-foreground text-sm">
              Services linked to your account.
            </p>
          </div>
          <Link
            href={routes.dashboard.integrations()}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <Link2 className="h-3.5 w-3.5" />
            Manage all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ZoomCard />
        </div>
      </section>
    </div>
  );
}
