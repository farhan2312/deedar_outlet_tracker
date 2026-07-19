import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { AdminPanel } from "@/features/admin/AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  return <AdminPanel adminName={user.name} />;
}
