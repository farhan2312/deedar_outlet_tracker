import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { LoginForm } from "@/features/auth/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect("/");
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/";
  return <LoginForm next={safeNext} />;
}
