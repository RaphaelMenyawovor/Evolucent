import Image from "next/image";
import Link from "next/link";
import { getSessionSafe } from "@/lib/auth-session";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/src/db";

export default async function AccountOverviewPage() {
  const session = await getSessionSafe();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      contributions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          project: { select: { title: true, region: true } },
        },
      },
      _count: { select: { contributions: true } },
    },
  });

  if (!user) {
    return (
      <p className="text-muted-foreground">
        We couldn&apos;t load your account record. Try signing out and back in.
      </p>
    );
  }

  const totalContributed = user.contributions.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-6">
        <Card className="border-evolucent-sand shadow-evolucent-card">
          <CardHeader className="border-b border-evolucent-sand">
            <CardTitle className="font-display text-lg">Your details</CardTitle>
            <CardDescription>
              How you appear when you contribute and on leaderboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={80}
                height={80}
                className="size-20 shrink-0 rounded-full border border-evolucent-sand object-cover"
              />
            ) : (
              <div
                className="flex size-20 shrink-0 items-center justify-center rounded-full bg-gold/20 font-display text-xl font-bold text-gold-dark"
                aria-hidden
              >
                {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <dl className="grid flex-1 gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Name
                </dt>
                <dd className="font-semibold text-evolucent-black">
                  {user.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </dt>
                <dd className="text-foreground">{user.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phone
                </dt>
                <dd className="text-foreground">{user.phoneNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Region
                </dt>
                <dd className="text-foreground">{user.region ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  KYC
                </dt>
                <dd className="font-mono text-xs text-foreground">
                  {user.kycStatus}
                </dd>
              </div>
            </dl>
            <Link
              href="/account/profile"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-evolucent-card transition hover:bg-gold-dark"
            >
              Edit profile
            </Link>
          </CardContent>
        </Card>

        <Card className="border-evolucent-sand shadow-evolucent-card">
          <CardHeader className="border-b border-evolucent-sand">
            <CardTitle className="font-display text-lg">
              Recent contributions
            </CardTitle>
            <CardDescription>
              {user._count.contributions === 0
                ? "No contributions yet — explore projects to make your first one."
                : `Last ${user.contributions.length} shown.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {user.contributions.length === 0 ? (
              <Link
                href="/projects"
                className="text-sm font-semibold text-civic-green underline-offset-4 hover:underline"
              >
                Browse projects →
              </Link>
            ) : (
              <ul className="divide-y divide-evolucent-sand">
                {user.contributions.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0"
                  >
                    <div>
                      <p className="font-medium text-evolucent-black">
                        {c.project.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.project.region} · {c.status} ·{" "}
                        {c.createdAt.toLocaleDateString("en-GH")}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-semibold text-civic-green-dark">
                      GHS {c.amount.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <aside className="flex flex-col gap-4">
        <Card className="border-evolucent-sand bg-evolucent-off-white shadow-evolucent-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total contributed</p>
              <p className="font-mono text-xl font-bold text-evolucent-black">
                GHS {totalContributed.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="font-mono text-lg font-semibold text-foreground">
                {user._count.contributions}
              </p>
            </div>
            <Link
              href="/leaderboard"
              className="mt-2 text-sm font-semibold text-civic-green underline-offset-4 hover:underline"
            >
              View leaderboards →
            </Link>
          </CardContent>
        </Card>
        <div className="rounded-xl border border-evolucent-sand bg-card p-4">
          <p className="mb-3 text-sm text-muted-foreground">Session</p>
          <SignOutButton />
        </div>
      </aside>
    </div>
  );
}
