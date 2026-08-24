"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { requireUser } from "@/lib/require-user";

export type FormState = { error?: string; success?: string } | undefined;

export async function createCustomerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name) return { error: "Customer name is required." };

  await db.insert(customers).values({
    name,
    email: email || null,
    phone: phone || null,
    address: address || null,
  });

  revalidatePath("/customers");
  return { success: "Customer added." };
}

export async function updateCustomerAction(customerId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name) return { error: "Customer name is required." };

  await db
    .update(customers)
    .set({ name, email: email || null, phone: phone || null, address: address || null })
    .where(eq(customers.id, customerId));

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { success: "Customer updated." };
}

export async function deleteCustomerAction(customerId: number) {
  await requireUser();
  await db.delete(customers).where(eq(customers.id, customerId));
  revalidatePath("/customers");
}
