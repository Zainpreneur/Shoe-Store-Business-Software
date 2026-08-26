import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { customers, products, productVariants, suppliers, users } from "./schema";

async function main() {
  console.log("Seeding database…");

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const staffPasswordHash = await bcrypt.hash("staff123", 10);

  await db
    .insert(users)
    .values([
      { name: "Store Admin", email: "admin@shoestore.test", passwordHash: adminPasswordHash, role: "admin" },
      { name: "Sales Staff", email: "staff@shoestore.test", passwordHash: staffPasswordHash, role: "staff" },
    ])
    .onConflictDoNothing();

  const [supplier] = await db
    .insert(suppliers)
    .values({
      name: "Summit Footwear Distributors",
      contactPerson: "Jamie Lee",
      email: "orders@summitfootwear.example",
      phone: "555-0182",
      address: "500 Industrial Way, Portland, OR",
    })
    .returning();

  const [c1] = await db
    .insert(customers)
    .values({ name: "Alex Morgan", email: "alex@example.com", phone: "555-0101" })
    .returning();
  const [c2] = await db
    .insert(customers)
    .values({ name: "Jordan Casey", email: "jordan@example.com", phone: "555-0199" })
    .returning();

  const catalog = [
    {
      name: "Trail Runner X2",
      brand: "Summit",
      category: "Running",
      description: "Lightweight trail running shoe with grippy rubber outsole.",
      costPrice: "38.00",
      sellingPrice: "89.99",
      variants: [
        { size: "8", color: "Black", sku: "TRX2-BLK-8", stockQuantity: 12 },
        { size: "9", color: "Black", sku: "TRX2-BLK-9", stockQuantity: 3 },
        { size: "10", color: "Black", sku: "TRX2-BLK-10", stockQuantity: 8 },
        { size: "9", color: "Slate", sku: "TRX2-SLT-9", stockQuantity: 5 },
      ],
    },
    {
      name: "Classic Court Sneaker",
      brand: "Summit",
      category: "Casual",
      description: "Everyday low-top sneaker with a cushioned footbed.",
      costPrice: "22.50",
      sellingPrice: "59.99",
      variants: [
        { size: "7", color: "White", sku: "CCS-WHT-7", stockQuantity: 15 },
        { size: "8", color: "White", sku: "CCS-WHT-8", stockQuantity: 2 },
        { size: "9", color: "White", sku: "CCS-WHT-9", stockQuantity: 10 },
        { size: "8", color: "Navy", sku: "CCS-NVY-8", stockQuantity: 6 },
      ],
    },
    {
      name: "Urban Hiker Boot",
      brand: "Northline",
      category: "Boots",
      description: "Water-resistant hiking boot for city and trail.",
      costPrice: "45.00",
      sellingPrice: "119.99",
      variants: [
        { size: "9", color: "Brown", sku: "UHB-BRN-9", stockQuantity: 7 },
        { size: "10", color: "Brown", sku: "UHB-BRN-10", stockQuantity: 4 },
        { size: "11", color: "Black", sku: "UHB-BLK-11", stockQuantity: 1 },
      ],
    },
    {
      name: "Featherlight Flat",
      brand: "Northline",
      category: "Casual",
      description: "Slip-on flat with a flexible sole for all-day comfort.",
      costPrice: "18.00",
      sellingPrice: "44.99",
      variants: [
        { size: "6", color: "Blush", sku: "FLF-BLS-6", stockQuantity: 9 },
        { size: "7", color: "Blush", sku: "FLF-BLS-7", stockQuantity: 11 },
        { size: "7", color: "Black", sku: "FLF-BLK-7", stockQuantity: 4 },
      ],
    },
  ];

  for (const item of catalog) {
    const [product] = await db
      .insert(products)
      .values({
        name: item.name,
        brand: item.brand,
        category: item.category,
        description: item.description,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        supplierId: supplier?.id ?? null,
      })
      .returning();

    await db.insert(productVariants).values(
      item.variants.map((v) => ({
        productId: product.id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stockQuantity: v.stockQuantity,
        reorderLevel: 5,
      }))
    );
  }

  console.log("Seed complete.");
  console.log("Login with admin@shoestore.test / admin123 or staff@shoestore.test / staff123");
  console.log(`Customers seeded: ${c1?.name}, ${c2?.name}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
