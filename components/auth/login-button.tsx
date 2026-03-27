"use client"

import { signIn } from "next-auth/react"

export function LoginButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google")}
      className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      Sign in with Google
    </button>
  )
}
