import { getAllSuppliers } from "@/lib/queries";
import { NewProductForm } from "./new-product-form";

export default async function NewProductPage() {
  const suppliers = await getAllSuppliers();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Add product</h1>
        <p className="text-sm text-slate-500">Create a product and its first size/color variant.</p>
      </div>
      <NewProductForm suppliers={suppliers} />
    </div>
  );
}
