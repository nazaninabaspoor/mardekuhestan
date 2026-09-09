import { UNVEIL_FUTURE_PRODUCTS } from "./v2-unveil-shared";

export function UnveilProductSlot({ index }: { index: number }) {
  const product = UNVEIL_FUTURE_PRODUCTS[index];
  if (!product) return null;
  return <span className="sr-only">{product.name}</span>;
}
