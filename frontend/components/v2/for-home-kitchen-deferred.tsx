"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";

import type { V2KitchenCatalogPayload } from "@/lib/catalog/v2-kitchen";
import { loadV2KitchenCatalog, staticKitchenPayload } from "@/lib/catalog/v2-kitchen";

const ForHomeKitchen = dynamic(
  () => import("@/components/v2/for-home-kitchen").then((mod) => mod.ForHomeKitchen),
  {
    ssr: false,
    loading: () => (
      <section
        aria-hidden
        style={{
          minHeight: "85vh",
          background:
            "linear-gradient(180deg, #0a5540 0%, #084735 24%, #063a2c 52%, #042f24 100%)",
        }}
      />
    ),
  },
);

/** Client-only kitchen — loads catalog from Django admin API with static fallback. */
export function ForHomeKitchenDeferred() {
  const [catalog, setCatalog] = useState<V2KitchenCatalogPayload>(() => staticKitchenPayload());

  useEffect(() => {
    let cancelled = false;
    void loadV2KitchenCatalog().then((payload) => {
      if (!cancelled) setCatalog(payload);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Suspense
      fallback={
        <section
          aria-hidden
          style={{
            minHeight: "85vh",
            background:
              "linear-gradient(180deg, #0a5540 0%, #084735 24%, #063a2c 52%, #042f24 100%)",
          }}
        />
      }
    >
      <ForHomeKitchen catalog={catalog} />
    </Suspense>
  );
}
