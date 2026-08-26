import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth";

export async function requireUser(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireUser();
  if (session.role !== "admin") {
    redirect("/dashboard?error=forbidden");
  }
  return session;
}
