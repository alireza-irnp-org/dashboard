"use client";

import { useZoomStatus } from "@/orval/hooks/zoom/zoom";


export default function OrvalTestPage() {
  const { data, isLoading, isError, error } = useZoomStatus();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Orval — Zoom Status</h1>

      {isLoading && (
        <p className="text-muted-foreground text-sm">Loading…</p>
      )}

      {isError && (
        <p className="text-destructive text-sm">
          Error: {(error as Error)?.message ?? "Unknown error"}
        </p>
      )}

      <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>

      {data && (
        <div className="rounded-lg border p-4 text-sm space-y-1">
          <p>
            <span className="font-medium">Connected:</span>{" "}
            {data.data.connected ? "Yes" : "No"}
          </p>
        </div>
      )}
    </div>
  );
}
