import { auth } from "@/auth";

/**
 * Wraps `auth()` so a Prisma/adapter failure (e.g. DB unreachable) does not
 * crash the root layout. Logs a warning in development.
 */
export async function getSessionSafe() {
  try {
    return await auth();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[evolucent] Auth session lookup failed. Is DATABASE_URL set and the database reachable?",
        error,
      );
    }
    return null;
  }
}
