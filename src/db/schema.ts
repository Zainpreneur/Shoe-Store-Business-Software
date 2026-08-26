import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  numeric,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["admin", "staff"]);
export const paymentMethod = pgEnum("payment_method", ["cash", "card", "mobile", "other"]);
export const orderStatus = pgEnum("order_status", ["completed", "refunded"]);
export const stockReason = pgEnum("stock_reason", ["sale", "restock", "adjustment", "refund"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("staff"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}));

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  contactPerson: varchar("contact_person", { length: 120 }),
  email: varchar("email", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  brand: varchar("brand", { length: 120 }),
  category: varchar("category", { length: 80 }).notNull().default("Uncategorized"),
  description: text("description"),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }).notNull().default("0"),
  sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }).notNull().default("0"),
  imageUrl: text("image_url"),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  archived: integer("archived").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  size: varchar("size", { length: 20 }).notNull(),
  color: varchar("color", { length: 40 }).notNull().default("Standard"),
  sku: varchar("sku", { length: 60 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(5),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  skuIdx: uniqueIndex("product_variants_sku_idx").on(table.sku),
}));

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 30 }).notNull(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: "set null" }),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
  paymentMethod: paymentMethod("payment_method").notNull().default("cash"),
  status: orderStatus("status").notNull().default("completed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  orderNumberIdx: uniqueIndex("orders_order_number_idx").on(table.orderNumber),
}));

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: varchar("product_name", { length: 200 }).notNull(),
  sku: varchar("sku", { length: 60 }).notNull(),
  size: varchar("size", { length: 20 }).notNull(),
  color: varchar("color", { length: 40 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  variantId: integer("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
  change: integer("change").notNull(),
  reason: stockReason("reason").notNull(),
  note: text("note"),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ many, one }) => ({
  variants: many(productVariants),
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  movements: many(stockMovements),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
  createdByUser: one(users, { fields: [orders.createdBy], references: [users.id] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  variant: one(productVariants, { fields: [stockMovements.variantId], references: [productVariants.id] }),
  order: one(orders, { fields: [stockMovements.orderId], references: [orders.id] }),
}));
