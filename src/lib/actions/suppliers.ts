"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { suppliers } from "@/db/schema";
import { requireUser } from "@/lib/require-user";

export type FormState = { error?: string; success?: string } | undefined;

export async function createSupplierAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const contactPerson = String(formData.get("contactPerson") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!name) return { error: "Supplier name is required." };

  await db.insert(suppliers).values({
    name,
    contactPerson: contactPerson || null,
    email: email || null,
    phone: phone || null,
    address: address || null,
  });

  revalidatePath("/suppliers");
  return { success: "Supplier added." };
}

export async function deleteSupplierAction(supplierId: number) {
  await requireUser();
  await db.delete(suppliers).where(eq(suppliers.id, supplierId));
  revalidatePath("/suppliers");
}
