"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

const FOOTER_SCENE = {
  default: "/brand/orginalfooter.png",
  v2: "/brand/orginalfooter-daylight.png",
} as const;

export function FooterSceneImage() {
  const pathname = usePathname();
  const isV2 = pathname === "/v2" || pathname?.startsWith("/v2/");
  const src = isV2 ? FOOTER_SCENE.v2 : FOOTER_SCENE.default;

  return (
    <Image
      src={src}
      alt=""
      width={1591}
      height={988}
      sizes="100vw"
      className="footer-scene-art"
      priority={false}
    />
  );
}
