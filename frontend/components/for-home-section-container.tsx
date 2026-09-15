import { ForHomeSection } from "@/components/for-home-section";
import { loadForHomeCatalog } from "@/lib/catalog/for-home";

export async function ForHomeSectionContainer() {
  const catalog = await loadForHomeCatalog();
  return <ForHomeSection catalog={catalog} />;
}
