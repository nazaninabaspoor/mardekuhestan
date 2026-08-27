import type { ProductCategoryId } from "@/data/productCategories";

type CategoryIconProps = {
  id: ProductCategoryId;
  className?: string;
};

export function CategoryIcon({ id, className }: CategoryIconProps) {
  if (id === "seafood") {
    return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12c3.2-4 7.4-5.2 12-2.4l3-2v4.1l-3 2.7C11.4 17.2 7.2 16 4 12Z" /><path d="M4 12 1.8 9.7M4 12l-2.2 2.3M13.3 10.8h.1" /></svg>;
  }
  if (id === "dairy") {
    return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 3h8l-1 4 2 3v10H7V10l2-3-1-4Z" /><path d="M8 12h9M10 3v4h4V3" /></svg>;
  }
  if (id === "ready-meal") {
    return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 16h18M5 16a7 7 0 0 1 14 0M12 7V4" /><path d="M10 4h4" /></svg>;
  }
  if (id === "farm") {
    return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19.5 4.5C13 4.7 8.6 7.4 7.5 13.3c5.9 1 9.9-1.8 12-8.8Z" /><path d="M4 20c2.7-6.1 6.4-8.8 11.8-11.1M7.4 13.4c-2.5-.8-4.1-2.4-4.9-5 3.1-.1 5.3.8 6.4 2.6" /></svg>;
  }
  return <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 14.7c0-4.1 3.1-7.2 7.2-7.2 3.4 0 5.5 1.4 8.8 4.7-2.2 3.5-5 5.3-8.7 5.3C7.2 17.5 4 16.4 4 14.7Z" /><path d="M8 12.2c1.7.2 3 .9 4 2.2M16.2 9.5l1.7-2" /></svg>;
}
