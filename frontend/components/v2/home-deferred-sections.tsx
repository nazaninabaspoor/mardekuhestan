"use client";

import dynamic from "next/dynamic";

import { LazyWhenVisible } from "@/components/v2/lazy-when-visible";

const V2UnveilSection = dynamic(
  () => import("@/components/v2/v2-unveil-section").then((mod) => mod.V2UnveilSection),
  {
    ssr: false,
    loading: () => <section aria-hidden style={{ minHeight: "85vh" }} />,
  },
);

const V2MagazineNotebook = dynamic(
  () => import("@/components/v2/v2-magazine-notebook").then((mod) => mod.V2MagazineNotebook),
  {
    ssr: false,
    loading: () => <section aria-hidden style={{ minHeight: "90vh" }} />,
  },
);

const V2CatalogFlipbook = dynamic(
  () => import("@/components/v2/v2-catalog-flipbook").then((mod) => mod.V2CatalogFlipbook),
  {
    ssr: false,
    loading: () => <section aria-hidden style={{ minHeight: "90vh" }} />,
  },
);

const SupportChatWidget = dynamic(
  () =>
    import("@/components/support/support-chat-widget").then(
      (mod) => mod.SupportChatWidget,
    ),
  { ssr: false },
);

export function HomeDeferredSections() {
  return (
    <>
      <LazyWhenVisible minHeight="85vh">
        <V2UnveilSection />
      </LazyWhenVisible>
      <LazyWhenVisible minHeight="90vh">
        <V2MagazineNotebook />
      </LazyWhenVisible>
      <LazyWhenVisible minHeight="90vh">
        <V2CatalogFlipbook />
      </LazyWhenVisible>
      <SupportChatWidget />
    </>
  );
}
