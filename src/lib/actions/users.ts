"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdmin } from "@/lib/require-user";

export type FormState = { error?: string; success?: string } | undefined;

export async function createUserAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "staff") === "admin" ? "admin" : "staff";

  if (!name || !email || password.length < 6) {
    return { error: "Name, email, and a password of at least 6 characters are required." };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({ name, email, passwordHash, role });
  } catch (err) {
    if (err instanceof Error && err.message.includes("users_email_idx")) {
      return { error: "A user with that email already exists." };
    }
    return { error: "Could not create user." };
  }

  revalidatePath("/staff");
  return { success: "Staff account created." };
}

export async function deleteUserAction(userId: number) {
  const session = await requireAdmin();
  if (session.userId === userId) return;
  await db.delete(users).where(eq(users.id, userId));
  revalidatePath("/staff");
}
