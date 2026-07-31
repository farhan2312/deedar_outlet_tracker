import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { listOutlets } from "@/lib/outlets";
import { OutletsReport } from "@/features/admin/OutletsReport";

export const dynamic = "force-dynamic";

export default async function AdminOutletsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");
  const outlets = await listOutlets(user.id, "admin");
  return <OutletsReport outlets={outlets} />;
}
