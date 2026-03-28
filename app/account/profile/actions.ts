"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { GHANA_REGIONS } from "@/lib/ghana-regions";
import { prisma } from "@/src/db";

export type ProfileActionState = {
  ok?: boolean;
  error?: string;
};

function normalizePhone(raw: string): string | null {
  const s = raw.trim().replace(/\s+/g, "");
  if (!s) return null;
  if (!/^\+?[0-9]{10,15}$/.test(s)) {
    return null;
  }
  return s;
}

export async function updateProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You need to be signed in to update your profile." };
  }

  const nameRaw = (formData.get("name") as string) ?? "";
  const phoneRaw = (formData.get("phoneNumber") as string) ?? "";
  const regionRaw = (formData.get("region") as string) ?? "";

  const name = nameRaw.trim() || null;
  const phone = phoneRaw.trim() ? normalizePhone(phoneRaw) : null;
  if (phoneRaw.trim() && !phone) {
    return { error: "Enter a valid phone number (digits only, 10–15 characters)." };
  }

  let region: string | null = null;
  if (regionRaw.trim()) {
    if (!GHANA_REGIONS.includes(regionRaw as (typeof GHANA_REGIONS)[number])) {
      return { error: "Please choose a valid Ghana region." };
    }
    region = regionRaw.trim();
  }

  try {
    if (phone) {
      const taken = await prisma.user.findFirst({
        where: {
          phoneNumber: phone,
          NOT: { id: session.user.id },
        },
        select: { id: true },
      });
      if (taken) {
        return { error: "That phone number is already used on another account." };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phoneNumber: phone,
        region,
      },
    });

    revalidatePath("/account");
    revalidatePath("/account/profile");
    revalidatePath("/leaderboard");
    return { ok: true };
  } catch {
    return { error: "Could not save changes. Try again in a moment." };
  }
}
