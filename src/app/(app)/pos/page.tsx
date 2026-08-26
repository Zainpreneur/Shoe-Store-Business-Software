import { getAllCustomers, getPosCatalog } from "@/lib/queries";
import { PosClient } from "./pos-client";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const [catalog, customers] = await Promise.all([getPosCatalog(), getAllCustomers()]);

  return (
    <div className="h-full">
      <PosClient catalog={catalog} customers={customers} />
    </div>
  );
}
