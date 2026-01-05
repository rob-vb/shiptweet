import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RepositorySelector } from "@/components/repository-selector";

export default async function RepositoriesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  if (!session.user.hasGithub) {
    redirect("/auth/signin");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Repositories</h1>
        <p className="text-muted-foreground mt-1">
          Connect your GitHub repositories to start generating tweets from your commits.
        </p>
      </div>

      <RepositorySelector />
    </div>
  );
}
