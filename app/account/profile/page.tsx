import { auth } from "@/auth";
import { ProfileForm } from "@/app/account/profile/profile-form";
import { prisma } from "@/src/db";

export default async function AccountProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return (
      <p className="text-muted-foreground">
        Account not found. Try signing out and signing in again.
      </p>
    );
  }

  return (
    <ProfileForm
      defaultName={user.name ?? ""}
      defaultPhone={user.phoneNumber ?? ""}
      defaultRegion={user.region ?? ""}
      email={user.email ?? ""}
      kycStatus={user.kycStatus}
    />
  );
}
