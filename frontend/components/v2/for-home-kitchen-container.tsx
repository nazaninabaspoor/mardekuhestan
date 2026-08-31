import { Suspense } from "react";

import { ForHomeKitchen } from "@/components/v2/for-home-kitchen";
import { loadV2KitchenCatalog } from "@/lib/catalog/v2-kitchen";

export async function ForHomeKitchenContainer() {
  const catalog = await loadV2KitchenCatalog();
  return (
    <Suspense fallback={<ForHomeKitchen catalog={catalog} />}>
      <ForHomeKitchen catalog={catalog} />
    </Suspense>
  );
}
