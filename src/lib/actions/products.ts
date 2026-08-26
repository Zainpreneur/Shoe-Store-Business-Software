"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants, stockMovements } from "@/db/schema";
import { requireUser } from "@/lib/require-user";

export type FormState = { error?: string; success?: string } | undefined;

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export async function createProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "Uncategorized";
  const description = String(formData.get("description") ?? "").trim();
  const costPrice = toNumber(formData.get("costPrice"));
  const sellingPrice = toNumber(formData.get("sellingPrice"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const supplierIdRaw = String(formData.get("supplierId") ?? "");
  const supplierId = supplierIdRaw ? Number(supplierIdRaw) : null;

  const size = String(formData.get("size") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim() || "Standard";
  const sku = String(formData.get("sku") ?? "").trim();
  const stockQuantity = toNumber(formData.get("stockQuantity"));
  const reorderLevel = toNumber(formData.get("reorderLevel"), 5);

  if (!name) return { error: "Product name is required." };
  if (!sku || !size) return { error: "Provide at least one variant with a size and SKU." };

  try {
    const [product] = await db
      .insert(products)
      .values({
        name,
        brand: brand || null,
        category,
        description: description || null,
        costPrice: costPrice.toFixed(2),
        sellingPrice: sellingPrice.toFixed(2),
        imageUrl: imageUrl || null,
        supplierId,
      })
      .returning();

    await db.insert(productVariants).values({
      productId: product.id,
      size,
      color,
      sku,
      stockQuantity,
      reorderLevel,
    });

    if (stockQuantity > 0) {
      const [variant] = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.sku, sku))
        .limit(1);
      if (variant) {
        await db.insert(stockMovements).values({
          variantId: variant.id,
          change: stockQuantity,
          reason: "restock",
          note: "Initial stock",
        });
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("product_variants_sku_idx")) {
      return { error: `SKU "${sku}" is already in use.` };
    }
    return { error: "Could not create product. Please check the details and try again." };
  }

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateProductAction(productId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || "Uncategorized";
  const description = String(formData.get("description") ?? "").trim();
  const costPrice = toNumber(formData.get("costPrice"));
  const sellingPrice = toNumber(formData.get("sellingPrice"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const supplierIdRaw = String(formData.get("supplierId") ?? "");
  const supplierId = supplierIdRaw ? Number(supplierIdRaw) : null;

  if (!name) return { error: "Product name is required." };

  await db
    .update(products)
    .set({
      name,
      brand: brand || null,
      category,
      description: description || null,
      costPrice: costPrice.toFixed(2),
      sellingPrice: sellingPrice.toFixed(2),
      imageUrl: imageUrl || null,
      supplierId,
    })
    .where(eq(products.id, productId));

  revalidatePath("/inventory");
  revalidatePath(`/inventory/${productId}`);
  return { success: "Product updated." };
}

export async function archiveProductAction(productId: number) {
  await requireUser();
  await db.update(products).set({ archived: 1 }).where(eq(products.id, productId));
  revalidatePath("/inventory");
}

export async function restoreProductAction(productId: number) {
  await requireUser();
  await db.update(products).set({ archived: 0 }).where(eq(products.id, productId));
  revalidatePath("/inventory");
}

export async function addVariantAction(productId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();

  const size = String(formData.get("size") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim() || "Standard";
  const sku = String(formData.get("sku") ?? "").trim();
  const stockQuantity = toNumber(formData.get("stockQuantity"));
  const reorderLevel = toNumber(formData.get("reorderLevel"), 5);

  if (!size || !sku) return { error: "Size and SKU are required." };

  try {
    const [variant] = await db
      .insert(productVariants)
      .values({ productId, size, color, sku, stockQuantity, reorderLevel })
      .returning();

    if (stockQuantity > 0) {
      await db.insert(stockMovements).values({
        variantId: variant.id,
        change: stockQuantity,
        reason: "restock",
        note: "Initial stock",
      });
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("product_variants_sku_idx")) {
      return { error: `SKU "${sku}" is already in use.` };
    }
    return { error: "Could not add variant." };
  }

  revalidatePath(`/inventory/${productId}`);
  return { success: "Variant added." };
}

export async function deleteVariantAction(productId: number, variantId: number) {
  await requireUser();
  await db.delete(productVariants).where(eq(productVariants.id, variantId));
  revalidatePath(`/inventory/${productId}`);
  revalidatePath("/inventory");
}

export async function adjustStockAction(productId: number, formData: FormData) {
  const session = await requireUser();

  const variantId = Number(formData.get("variantId"));
  const delta = toNumber(formData.get("delta"));
  const note = String(formData.get("note") ?? "").trim();

  if (!variantId || !delta) {
    revalidatePath(`/inventory/${productId}`);
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(productVariants)
      .set({ stockQuantity: sql`${productVariants.stockQuantity} + ${delta}` })
      .where(eq(productVariants.id, variantId));

    await tx.insert(stockMovements).values({
      variantId,
      change: delta,
      reason: "adjustment",
      note: note || null,
      createdBy: session.userId,
    });
  });

  revalidatePath(`/inventory/${productId}`);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}
