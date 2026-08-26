import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { getAllSuppliers } from "@/lib/queries";
import { EditProductForm } from "./edit-product-form";
import { VariantsPanel } from "./variants-panel";
import { archiveProductAction, restoreProductAction } from "@/lib/actions/products";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const [product, suppliers, variants] = await Promise.all([
    db.query.products.findFirst({ where: eq(products.id, productId) }),
    getAllSuppliers(),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(productVariants.size),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{product.name}</h1>
          <p className="text-sm text-slate-500">{product.category}{product.brand ? ` · ${product.brand}` : ""}</p>
        </div>
        {product.archived ? (
          <form action={restoreProductAction.bind(null, product.id)}>
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Restore product
            </button>
          </form>
        ) : (
          <form action={archiveProductAction.bind(null, product.id)}>
            <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
              Archive product
            </button>
          </form>
        )}
      </div>

      <EditProductForm product={product} suppliers={suppliers} />
      <VariantsPanel productId={product.id} variants={variants} />
    </div>
  );
}
