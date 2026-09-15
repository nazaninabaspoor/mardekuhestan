/** آدرس سایت و اینماد — فقط از متغیر محیطی (Runflare / .env) */

const trim = (v: string | undefined) => (v ?? "").trim();

export const publicSiteUrl =
  trim(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000";

export const enamadConfig = {
  /** شناسه عددی اینماد (پارامتر id در trustseal.enamad.ir) */
  id: trim(process.env.NEXT_PUBLIC_ENAMAD_ID),
  /** کد اختصاصی اینماد (پارامتر Code) */
  code: trim(process.env.NEXT_PUBLIC_ENAMAD_CODE),
};

export function hasEnamadBadge(): boolean {
  return Boolean(enamadConfig.id && enamadConfig.code);
}
