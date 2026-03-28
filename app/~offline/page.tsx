import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline | Evolucent",
  description: "You are currently offline.",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-24 text-center">
      <div className="rounded-full bg-muted/50 p-6">
        <WifiOff className="size-12 text-muted-foreground" />
      </div>
      <h1 className="mt-8 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        You're offline
      </h1>
      <p className="mt-4 max-w-sm text-base text-muted-foreground">
        It looks like you've lost your internet connection. Some features of Evolucent require an active connection to function.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-evolucent-card transition hover:bg-gold-dark hover:shadow-evolucent-elevated"
      >
        Try Again
      </Link>
    </div>
  );
}
