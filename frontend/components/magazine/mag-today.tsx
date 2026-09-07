import { MagSearch } from "@/components/magazine/mag-search";

export function MagToday({ query = "" }: { query?: string }) {
  return (
    <section className="mk-issue">
      <p>مجله مرد کوهستان</p>
      <h1>این راه سبز است</h1>
      <span>داستان کوه، مرتع و سفره. روی کارت بزنید و بخوانید.</span>
      <MagSearch query={query} />
    </section>
  );
}
