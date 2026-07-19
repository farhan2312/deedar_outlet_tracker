import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { SignupForm } from "@/features/auth/SignupForm";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect("/");
  return <SignupForm />;
}
