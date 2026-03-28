"use client";

import * as React from "react";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

type ClientRelativeTimeProps = {
  date: Date;
  className?: string;
};

/**
 * Renders relative time only after mount so SSR and hydration output match.
 * Placeholder is identical on server and client until `useEffect` runs.
 */
export function ClientRelativeTime({ date, className }: ClientRelativeTimeProps) {
  const [label, setLabel] = React.useState("—");

  React.useEffect(() => {
    const update = () => setLabel(formatTimestamp(date));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, [date]);

  return (
    <time className={cn(className)} dateTime={date.toISOString()}>
      {label}
    </time>
  );
}
