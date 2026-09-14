type OrderLine = Record<string, unknown>;

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

/** Opens a print-ready order certificate or invoice without exporting page internals. */
export function handleDownloadOrderPdf(
  type: "book" | "invoice",
  data: Record<string, unknown>,
  buyerInfo: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank", "width=850,height=1000");
  if (!printWindow) return;

  const rows = Array.isArray(data.items) ? data.items as OrderLine[] : [];
  const isBook = type === "book";
  const title = isBook ? "شناسنامه اصالت مرتع" : "پیش‌فاکتور سفارش";
  const itemRows = rows.map((item, index) => {
    const description = item.name ?? item.title ?? "کالا";
    const detail = isBook ? item.cut ?? item.weight ?? "—" : item.code ?? item.weight ?? "—";
    const price = item.price ?? item.total ?? "—";
    return `<tr><td>${index + 1}</td><td>${escapeHtml(description)}</td><td>${escapeHtml(detail)}</td><td>${escapeHtml(price)}</td></tr>`;
  }).join("");
  const customer = isBook ? "" : `<p><strong>خریدار:</strong> ${escapeHtml(buyerInfo.name)} &nbsp; <strong>تلفن:</strong> ${escapeHtml(buyerInfo.phone)}<br/><strong>نشانی:</strong> ${escapeHtml(buyerInfo.address)}</p>`;
  const reference = data.invoiceNumber ?? data.id ?? "—";
  const total = data.finalPrice ?? data.payableAmount ?? "—";

  printWindow.document.write(`<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"/><title>${title}</title><style>body{font-family:Tahoma,Arial,sans-serif;color:#1d1d1b;padding:32px;direction:rtl}.sheet{border:2px solid #005b48;padding:28px;border-radius:12px}h1{color:#005b48;font-size:22px}table{width:100%;border-collapse:collapse;margin:22px 0}th{background:#005b48;color:#fff}th,td{padding:10px;text-align:right;border-bottom:1px solid #ddd}.total{font-weight:bold;color:#005b48}@media print{body{padding:0}.sheet{border:0}}</style></head><body><main class="sheet"><h1>${title}</h1><p>شماره پیگیری: ${escapeHtml(reference)}</p>${customer}<table><thead><tr><th>ردیف</th><th>شرح کالا</th><th>جزئیات</th><th>مبلغ</th></tr></thead><tbody>${itemRows}</tbody></table><p class="total">مبلغ قابل پرداخت: ${escapeHtml(total)}</p></main><script>window.onload=()=>window.print()</script></body></html>`);
  printWindow.document.close();
}

export function resolveProductImage(name: string, rawImage?: string): string {
  const normalized = (name || "").toLowerCase();
  if (normalized.includes("عسل") || normalized.includes("کندو") || normalized.includes("honey")) return "/brand/home-ready.png";
  if (normalized.includes("پنیر") || normalized.includes("cheese") || normalized.includes("panir")) return "/brand/panir.png";
  if (normalized.includes("کره") || normalized.includes("روغن") || normalized.includes("ماست") || normalized.includes("دوغ") || normalized.includes("شیر") || normalized.includes("لبنیات") || normalized.includes("dairy")) return "/brand/home-dairy.png";
  if (normalized.includes("ماهی") || normalized.includes("قزل") || normalized.includes("میگو") || normalized.includes("آبزیان") || normalized.includes("seafood") || normalized.includes("fish")) return "/brand/mahi.png";
  if (rawImage && rawImage !== "/brand/home-meat.png" && rawImage.startsWith("/")) return rawImage;
  return "/brand/goosht.png";
}
