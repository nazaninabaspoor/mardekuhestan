"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { LazyWhenVisible } from "@/components/v2/lazy-when-visible";

const greenPlaceholder = {
  minHeight: "85vh",
  background:
    "linear-gradient(180deg, #0a5540 0%, #084735 28%, #063a2c 58%, #042f24 100%)",
} as const;

const creamPlaceholder = {
  minHeight: "90vh",
  background: "#F4F0E8",
} as const;

const ForHomeKitchenDeferred = dynamic(
  () =>
    import("@/components/v2/for-home-kitchen-deferred").then(
      (mod) => mod.ForHomeKitchenDeferred,
    ),
  {
    ssr: false,
    loading: () => <section aria-hidden style={greenPlaceholder} />,
  },
);

const V2UnveilSection = dynamic(
  () => import("@/components/v2/v2-unveil-section").then((mod) => mod.V2UnveilSection),
  {
    ssr: false,
    loading: () => <section aria-hidden style={greenPlaceholder} />,
  },
);

const V2MagazineNotebook = dynamic(
  () => import("@/components/v2/v2-magazine-notebook").then((mod) => mod.V2MagazineNotebook),
  {
    ssr: false,
    loading: () => <section aria-hidden style={creamPlaceholder} />,
  },
);

const V2CatalogFlipbook = dynamic(
  () => import("@/components/v2/v2-catalog-flipbook").then((mod) => mod.V2CatalogFlipbook),
  {
    ssr: false,
    loading: () => <section aria-hidden style={creamPlaceholder} />,
  },
);

const SupportChatWidget = dynamic(
  () =>
    import("@/components/support/support-chat-widget").then(
      (mod) => mod.SupportChatWidget,
    ),
  { ssr: false },
);

function DeferredChat() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 2200);
    return () => window.clearTimeout(id);
  }, []);
  return show ? <SupportChatWidget /> : null;
}

/** Everything below the hero — never on the critical first paint path. */
export function HomeDeferredSections() {
  useEffect(() => {
    // Warm chunks while user is still on hero/kitchen so lower sections never flash white.
    const warm = window.setTimeout(() => {
      void import("@/components/v2/v2-unveil-section");
      void import("@/components/v2/v2-unveil-canvas");
      void import("@/components/v2/v2-magazine-notebook");
      void import("@/components/v2/v2-catalog-flipbook");
    }, 700);
    return () => window.clearTimeout(warm);
  }, []);

  return (
    <>
      <LazyWhenVisible
        minHeight="85vh"
        leadVh={0.55}
        trailVh={1.2}
        mode="once"
        placeholderStyle={greenPlaceholder}
      >
        <ForHomeKitchenDeferred />
      </LazyWhenVisible>
      <LazyWhenVisible
        minHeight="85vh"
        leadVh={0.85}
        trailVh={1.2}
        mode="once"
        placeholderStyle={greenPlaceholder}
      >
        <V2UnveilSection />
      </LazyWhenVisible>
      <LazyWhenVisible
        minHeight="90vh"
        leadVh={1.1}
        trailVh={1.2}
        mode="once"
        placeholderStyle={creamPlaceholder}
      >
        <V2MagazineNotebook />
      </LazyWhenVisible>
      <LazyWhenVisible
        minHeight="90vh"
        leadVh={1.1}
        trailVh={1.2}
        mode="once"
        placeholderStyle={creamPlaceholder}
      >
        <V2CatalogFlipbook />
      </LazyWhenVisible>
      <DeferredChat />
    </>
  );
}
