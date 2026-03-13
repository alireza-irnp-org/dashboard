"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLinkSocial, useUnlinkSocial } from "@/lib/auth/hooks/use-auth";
import { zoomKeys, useZoomMeetings, useZoomProfile, useZoomStatus } from "@/lib/zoom/use-zoom";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, ExternalLink, Link2, Link2Off, Users, Video } from "lucide-react";
import { toast } from "sonner";

export function ZoomCard() {
  const { data: statusData, isLoading: statusLoading } = useZoomStatus();
  const isConnected = statusData?.connected ?? false;

  const { data: profileData } = useZoomProfile({ enabled: isConnected });

  const {
    data: meetingsData,
    isLoading: meetingsLoading,
  } = useZoomMeetings("upcoming", { enabled: isConnected });

  const queryClient = useQueryClient();
  const linkSocial = useLinkSocial();
  const unlinkSocial = useUnlinkSocial();

  function handleConnect() {
    linkSocial.mutate({ provider: "zoom" }, {
      onError: () => {
        toast.error("Failed to connect Zoom. Please try again.");
      },
    });
  }

  function handleDisconnect() {
    unlinkSocial.mutate("zoom", {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: zoomKeys.status() });
        queryClient.removeQueries({ queryKey: zoomKeys.meetings() });
        toast.success("Zoom disconnected.");
      },
      onError: () => {
        toast.error("Failed to disconnect Zoom. Please try again.");
      },
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2D8CFF]/10">
              {isConnected && profileData?.pic_url ? (
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={profileData.pic_url} alt={profileData.first_name} />
                  <AvatarFallback className="rounded-lg bg-[#2D8CFF]/10 text-[#2D8CFF]">
                    {profileData.first_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Video className="h-5 w-5 text-[#2D8CFF]" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">Zoom</CardTitle>
              <CardDescription className="text-xs">
                {isConnected && profileData
                  ? `${profileData.first_name} ${profileData.last_name}`
                  : "Video meetings & webinars"}
              </CardDescription>
            </div>
          </div>

          {statusLoading ? (
            <Skeleton className="h-5 w-20 rounded-full" />
          ) : isConnected ? (
            <Badge variant="outline" className="gap-1.5 border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Not connected
            </Badge>
          )}
        </div>
      </CardHeader>

      {isConnected && (
        <>
          <Separator />
          <CardContent className="pt-4">
            <p className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wide">
              Upcoming meetings
            </p>

            {meetingsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : meetingsData?.meetings?.length ? (
              <ul className="space-y-2">
                {meetingsData.meetings.slice(0, 5).map((meeting) => (
                  <li
                    key={meeting.id}
                    className="bg-muted/40 flex items-start justify-between rounded-lg p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{meeting.topic}</p>
                      <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {meeting.start_time && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(meeting.start_time), "MMM d, yyyy")}
                          </span>
                        )}
                        {meeting.start_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(meeting.start_time), "h:mm a")}
                          </span>
                        )}
                        {meeting.duration > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {meeting.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                    {meeting.join_url && (
                      <a
                        href={meeting.join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground ml-3 shrink-0 transition-colors"
                        aria-label="Join meeting"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No upcoming meetings
              </p>
            )}
          </CardContent>
        </>
      )}

      <CardFooter className={isConnected ? "pt-2" : undefined}>
        {statusLoading ? (
          <Skeleton className="h-9 w-32 rounded-md" />
        ) : isConnected ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDisconnect}
            disabled={unlinkSocial.isPending}
          >
            <Link2Off className="h-4 w-4" />
            {unlinkSocial.isPending ? "Disconnecting…" : "Disconnect"}
          </Button>
        ) : (
          <Button
            size="sm"
            className="gap-2"
            onClick={handleConnect}
            disabled={linkSocial.isPending}
          >
            <Link2 className="h-4 w-4" />
            {linkSocial.isPending ? "Connecting…" : "Connect Zoom"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
