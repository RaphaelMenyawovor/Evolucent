"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GHANA_REGIONS } from "@/lib/ghana-regions";
import { cn } from "@/lib/utils";
import {
  type ProfileActionState,
  updateProfile,
} from "@/app/account/profile/actions";

const inputClass =
  "w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

type Props = {
  defaultName: string;
  defaultPhone: string;
  defaultRegion: string;
  email: string;
  kycStatus: string;
};

export function ProfileForm({
  defaultName,
  defaultPhone,
  defaultRegion,
  email,
  kycStatus,
}: Props) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    {} as ProfileActionState,
  );

  return (
    <Card className="max-w-xl border-evolucent-sand shadow-evolucent-card">
      <CardHeader className="border-b border-evolucent-sand">
        <CardTitle className="font-display text-lg">Edit profile</CardTitle>
        <CardDescription>
          Update how you appear on Evolucent. Email comes from your Google
          account and can&apos;t be changed here.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="grid gap-4 pt-6">
          {state?.error ? (
            <p
              className="rounded-[var(--radius-md)] border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}
          {state?.ok ? (
            <p
              className="rounded-[var(--radius-md)] border border-civic-green/30 bg-civic-green-light px-3 py-2 text-sm text-civic-green-dark"
              role="status"
            >
              Profile saved.
            </p>
          ) : null}

          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Display name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={defaultName}
              className={inputClass}
              placeholder="Your name"
            />
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-foreground">Email</span>
            <input
              type="email"
              value={email}
              readOnly
              className={cn(inputClass, "cursor-not-allowed bg-muted/50")}
              aria-readonly="true"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="phoneNumber"
              className="text-sm font-medium text-foreground"
            >
              Phone (optional)
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              defaultValue={defaultPhone}
              className={inputClass}
              placeholder="e.g. 0241234567"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="region" className="text-sm font-medium text-foreground">
              Home region (optional)
            </label>
            <select
              id="region"
              name="region"
              defaultValue={defaultRegion}
              className={inputClass}
            >
              <option value="">Select region</option>
              {GHANA_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Used for regional leaderboards. You can leave this blank.
            </p>
          </div>

          <div className="grid gap-1 rounded-[var(--radius-md)] border border-evolucent-sand bg-evolucent-off-white px-3 py-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Verification
            </span>
            <span className="text-sm font-semibold text-evolucent-black">
              {kycStatus}
            </span>
          </div>
        </CardContent>
        <CardFooter className="border-t border-evolucent-sand">
          <Button type="submit" disabled={pending} className="min-w-[120px]">
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
