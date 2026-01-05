import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const connectTwitterAction = async () => {
    "use server";
    await signIn("twitter", { redirectTo: "/settings" });
  };

  return (
    <SettingsClient
      user={user}
      hasGithub={session.user.hasGithub}
      hasTwitter={session.user.hasTwitter}
      connectTwitterAction={connectTwitterAction}
    />
  );
}
