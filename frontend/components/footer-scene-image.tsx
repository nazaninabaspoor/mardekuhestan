"use client";

import Image from "next/image";

const FOOTER_SCENE = "/brand/orginalfooter-daylight-v2.png";

export function FooterSceneImage() {
  return (
    <Image
      src={FOOTER_SCENE}
      alt=""
      width={1591}
      height={988}
      sizes="100vw"
      className="footer-scene-art"
      priority={false}
    />
  );
}
