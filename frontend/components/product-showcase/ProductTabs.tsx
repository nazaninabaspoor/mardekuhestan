import type { ProductCategory, ProductCategoryId } from "@/data/productCategories";

type ProductTabsProps = {
  categories: ReadonlyArray<ProductCategory>;
  activeCategoryId: ProductCategoryId;
  onChange: (id: ProductCategoryId) => void;
  menuClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;
};

export function ProductTabs({
  categories,
  activeCategoryId,
  onChange,
  menuClassName = "",
  itemClassName = "",
  activeItemClassName = "",
}: ProductTabsProps) {
  return (
    <nav className={menuClassName} aria-label="دسته‌بندی محصولات">
      {categories.map((category) => {
        const active = category.id === activeCategoryId;
        return (
          <button
            key={category.id}
            type="button"
            className={`${itemClassName}${active ? ` ${activeItemClassName}` : ""}`}
            aria-pressed={active}
            onClick={() => onChange(category.id)}
          >
            {category.title}
          </button>
        );
      })}
    </nav>
  );
}
