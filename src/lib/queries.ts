import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { customers, orderItems, orders, productVariants, products, suppliers } from "@/db/schema";

export async function getDashboardStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [revenueTotals] = await db
    .select({
      total: sql<string>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(eq(orders.status, "completed"));

  const [todayTotals] = await db
    .select({
      total: sql<string>`coalesce(sum(${orders.total}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(eq(orders.status, "completed"), gte(orders.createdAt, startOfToday)));

  const [{ count: lowStockCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productVariants)
    .where(sql`${productVariants.stockQuantity} <= ${productVariants.reorderLevel}`);

  const [{ count: productCount }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(eq(products.archived, 0));

  const [{ count: customerCount }] = await db.select({ count: sql<number>`count(*)` }).from(customers);

  return {
    totalRevenue: revenueTotals?.total ?? "0",
    totalOrders: Number(revenueTotals?.count ?? 0),
    todayRevenue: todayTotals?.total ?? "0",
    todayOrders: Number(todayTotals?.count ?? 0),
    lowStockCount: Number(lowStockCount ?? 0),
    productCount: Number(productCount ?? 0),
    customerCount: Number(customerCount ?? 0),
  };
}

export async function getRevenueTrend(days = 14) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      total: sql<string>`coalesce(sum(${orders.total}), 0)`,
    })
    .from(orders)
    .where(and(eq(orders.status, "completed"), gte(orders.createdAt, since)))
    .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);

  const totals = new Map(rows.map((r) => [r.day, Number(r.total)]));
  const series: Array<{ date: string; revenue: number }> = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    series.push({ date: key, revenue: totals.get(key) ?? 0 });
  }
  return series;
}

export async function getTopProducts(limit = 5, since?: Date) {
  const conditions = [eq(orders.status, "completed")];
  if (since) conditions.push(gte(orders.createdAt, since));

  return db
    .select({
      productName: orderItems.productName,
      unitsSold: sql<number>`sum(${orderItems.quantity})`,
      revenue: sql<string>`sum(${orderItems.subtotal})`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(...conditions))
    .groupBy(orderItems.productName)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(limit);
}

export async function getRecentOrders(limit = 8) {
  return db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    limit,
    with: {
      customer: true,
    },
  });
}

export async function getLowStockVariants(limit = 50) {
  return db
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      stockQuantity: productVariants.stockQuantity,
      reorderLevel: productVariants.reorderLevel,
      productId: products.id,
      productName: products.name,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(sql`${productVariants.stockQuantity} <= ${productVariants.reorderLevel}`)
    .orderBy(productVariants.stockQuantity)
    .limit(limit);
}

export async function getStockValuation() {
  const [row] = await db
    .select({
      retailValue: sql<string>`coalesce(sum(${productVariants.stockQuantity} * ${products.sellingPrice}), 0)`,
      costValue: sql<string>`coalesce(sum(${productVariants.stockQuantity} * ${products.costPrice}), 0)`,
      units: sql<number>`coalesce(sum(${productVariants.stockQuantity}), 0)`,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id));

  return {
    retailValue: row?.retailValue ?? "0",
    costValue: row?.costValue ?? "0",
    units: Number(row?.units ?? 0),
  };
}

export async function getSalesForRange(start: Date, end: Date) {
  return db.query.orders.findMany({
    where: and(eq(orders.status, "completed"), gte(orders.createdAt, start), sql`${orders.createdAt} <= ${end}`),
    orderBy: [desc(orders.createdAt)],
    with: { customer: true, items: true },
  });
}

export async function getAllProductsWithVariants() {
  return db.query.products.findMany({
    where: eq(products.archived, 0),
    orderBy: [products.name],
    with: {
      variants: { orderBy: [productVariants.size] },
      supplier: true,
    },
  });
}

export async function getPosCatalog() {
  return db
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      stockQuantity: productVariants.stockQuantity,
      productId: products.id,
      productName: products.name,
      brand: products.brand,
      category: products.category,
      sellingPrice: products.sellingPrice,
      imageUrl: products.imageUrl,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(products.archived, 0))
    .orderBy(products.name, productVariants.size);
}

export async function getAllSuppliers() {
  return db.select().from(suppliers).orderBy(suppliers.name);
}

export async function getAllCustomers() {
  return db.select().from(customers).orderBy(desc(customers.createdAt));
}
