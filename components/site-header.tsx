import Image from "next/image";
import Link from "next/link";
import { getSessionSafe } from "@/lib/auth-session";
import { LoginButton } from "@/components/auth/login-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/feed", label: "Feed" },
  { href: "/#pulse", label: "The Pulse" },
  { href: "/poll", label: "Poll" },
  { href: "/impact", label: "Impact" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/ledger", label: "Ledger" },
] as const;

export async function SiteHeader() {
  const session = await getSessionSafe();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-evolucent-card backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-base font-bold tracking-tight text-foreground"
        >
          <span className="text-gold" aria-hidden>
            ✦
          </span>
          <span>EVOLUCENT</span>
        </Link>
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Primary"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/#contribute"
            className={cn(
              "hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-evolucent-card transition hover:bg-gold-dark hover:shadow-evolucent-elevated sm:inline-flex"
            )}
          >
            Contribute →
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="flex min-w-0 max-w-50 items-center gap-2 rounded-md pr-1 transition hover:bg-muted/60"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : null}
                <span className="truncate text-sm font-medium text-muted-foreground hover:text-foreground">
                  {session.user.name ?? session.user.email ?? "Account"}
                </span>
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </header>
  );
}
