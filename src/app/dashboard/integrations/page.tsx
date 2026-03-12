import { ZoomCard } from "./_components/zoom-card";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Connect third-party services to your account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ZoomCard />
      </div>
    </div>
  );
}
