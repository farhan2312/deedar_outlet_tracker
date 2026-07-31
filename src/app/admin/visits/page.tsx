import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { listOutlets } from "@/lib/outlets";
import { listUsers } from "@/lib/users";
import { VisitsReport } from "@/features/admin/VisitsReport";

export const dynamic = "force-dynamic";

export default async function AdminVisitsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  const [outlets, users] = await Promise.all([
    listOutlets(user.id, "admin"),
    listUsers(),
  ]);
  const repNames: Record<string, string> = {};
  for (const u of users) repNames[u.phone] = u.name;
  return <VisitsReport outlets={outlets} repNames={repNames} />;
}
