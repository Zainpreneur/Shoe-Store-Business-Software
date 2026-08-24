"use server";

import { revalidatePath } from "next/cache";
import { eq, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, productVariants, products, stockMovements } from "@/db/schema";
import { requireUser } from "@/lib/require-user";

export type CartItem = { variantId: number; quantity: number };

export type CreateSaleInput = {
  customerId: number | null;
  paymentMethod: "cash" | "card" | "mobile" | "other";
  discount: number;
  items: CartItem[];
};

export type CreateSaleResult = { error?: string; orderId?: number; orderNumber?: string };

export async function createSaleAction(input: CreateSaleInput): Promise<CreateSaleResult> {
  const session = await requireUser();

  if (!input.items?.length) {
    return { error: "Add at least one item to the cart." };
  }

  const variantIds = input.items.map((i) => i.variantId);

  try {
    const result = await db.transaction(async (tx) => {
      const variantRows = await tx
        .select({
          id: productVariants.id,
          sku: productVariants.sku,
          size: productVariants.size,
          color: productVariants.color,
          stockQuantity: productVariants.stockQuantity,
          productId: productVariants.productId,
          productName: products.name,
          sellingPrice: products.sellingPrice,
        })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(inArray(productVariants.id, variantIds));

      const variantMap = new Map(variantRows.map((v) => [v.id, v]));

      let subtotal = 0;
      const lineItems: Array<{
        variantId: number;
        productName: string;
        sku: string;
        size: string;
        color: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
      }> = [];

      for (const item of input.items) {
        const variant = variantMap.get(item.variantId);
        if (!variant) throw new Error(`Item not found in catalog.`);
        if (item.quantity <= 0) throw new Error(`Invalid quantity for ${variant.sku}.`);
        if (variant.stockQuantity < item.quantity) {
          throw new Error(`Not enough stock for ${variant.productName} (${variant.size}) — only ${variant.stockQuantity} left.`);
        }
        const unitPrice = Number(variant.sellingPrice);
        const lineTotal = unitPrice * item.quantity;
        subtotal += lineTotal;
        lineItems.push({
          variantId: variant.id,
          productName: variant.productName,
          sku: variant.sku,
          size: variant.size,
          color: variant.color,
          unitPrice,
          quantity: item.quantity,
          lineTotal,
        });
      }

      const discount = Math.min(Math.max(input.discount || 0, 0), subtotal);
      const total = subtotal - discount;
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber,
          customerId: input.customerId,
          createdBy: session.userId,
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          tax: "0",
          total: total.toFixed(2),
          paymentMethod: input.paymentMethod,
          status: "completed",
        })
        .returning();

      for (const line of lineItems) {
        await tx.insert(orderItems).values({
          orderId: order.id,
          variantId: line.variantId,
          productName: line.productName,
          sku: line.sku,
          size: line.size,
          color: line.color,
          unitPrice: line.unitPrice.toFixed(2),
          quantity: line.quantity,
          subtotal: line.lineTotal.toFixed(2),
        });

        await tx
          .update(productVariants)
          .set({ stockQuantity: sql`${productVariants.stockQuantity} - ${line.quantity}` })
          .where(eq(productVariants.id, line.variantId));

        await tx.insert(stockMovements).values({
          variantId: line.variantId,
          change: -line.quantity,
          reason: "sale",
          orderId: order.id,
          createdBy: session.userId,
        });
      }

      return order;
    });

    revalidatePath("/pos");
    revalidatePath("/inventory");
    revalidatePath("/orders");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { orderId: result.id, orderNumber: result.orderNumber };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not complete the sale." };
  }
}

export async function refundOrderAction(orderId: number) {
  const session = await requireUser();

  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order || order.status === "refunded") return;

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));

    for (const item of items) {
      if (!item.variantId) continue;
      await tx
        .update(productVariants)
        .set({ stockQuantity: sql`${productVariants.stockQuantity} + ${item.quantity}` })
        .where(eq(productVariants.id, item.variantId));

      await tx.insert(stockMovements).values({
        variantId: item.variantId,
        change: item.quantity,
        reason: "refund",
        orderId,
        createdBy: session.userId,
      });
    }

    await tx.update(orders).set({ status: "refunded" }).where(eq(orders.id, orderId));
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}
