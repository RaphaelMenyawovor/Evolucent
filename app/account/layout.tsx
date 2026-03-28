import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cn } from "@/lib/utils";

const subNav = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "Profile" },
] as const;

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(
      `/api/auth/signin?callbackUrl=${encodeURIComponent("/account")}`,
    );
  }

  return (
    <div className="min-h-screen bg-evolucent-off-white">
      <section className="border-b border-evolucent-sand bg-evolucent-black px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-[1152px]">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-gold">
            Your account
          </p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-evolucent-off-white sm:text-3xl">
            Welcome back,{" "}
            <span className="text-gold">
              {session.user.name?.split(" ")[0] ?? "citizen"}
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#a8a49c]">
            Manage your Evolucent profile and see how you show up on civic
            leaderboards.
          </p>
          <nav
            className="mt-6 flex flex-wrap gap-2"
            aria-label="Account sections"
          >
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-evolucent-off-white transition-colors hover:border-gold/50 hover:text-gold",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <div className="mx-auto max-w-[1152px] px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
