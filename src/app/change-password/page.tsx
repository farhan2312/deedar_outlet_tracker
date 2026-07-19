import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { ChangePasswordForm } from "@/features/auth/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <ChangePasswordForm forced={user.mustChange} />;
}
