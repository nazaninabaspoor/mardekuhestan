import { enamadConfig, hasEnamadBadge } from "@/lib/site-env";

/** لوگوی رسمی اینماد — بعد از صدور نماد، id و Code را در env بگذارید. */
export function EnamadBadge() {
  if (!hasEnamadBadge()) {
    return (
      <div className="mk-enamad-placeholder" aria-hidden="true">
        <span className="mk-enamad-placeholder-label">جایگاه نماد اعتماد الکترونیکی (اینماد)</span>
      </div>
    );
  }

  const { id, code } = enamadConfig;
  const sealUrl = `https://trustseal.enamad.ir/?id=${encodeURIComponent(id)}&Code=${encodeURIComponent(code)}`;
  const logoUrl = `https://trustseal.enamad.ir/logo.aspx?id=${encodeURIComponent(id)}&Code=${encodeURIComponent(code)}`;

  return (
    <a
      referrerPolicy="origin"
      target="_blank"
      rel="noopener noreferrer"
      href={sealUrl}
      className="mk-enamad-badge"
      aria-label="نماد اعتماد الکترونیکی — اینماد"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt=""
        width={90}
        height={90}
        loading="lazy"
        decoding="async"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
