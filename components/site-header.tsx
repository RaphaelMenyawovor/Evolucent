import Image from "next/image"
import Link from "next/link"
import { auth } from "@/auth"
import { LoginButton } from "@/components/auth/login-button"
import { SignOutButton } from "@/components/auth/sign-out-button"

export async function SiteHeader() {
  const session = await auth()

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Evolucent
        </Link>
        <nav className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : null}
              <span className="max-w-48 truncate text-sm text-zinc-700 dark:text-zinc-300">
                {session.user.name ?? session.user.email ?? "Signed in"}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <LoginButton />
          )}
        </nav>
      </div>
    </header>
  )
}
