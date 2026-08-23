import { valueChain } from "@/lib/brand";

export default function ChainPage() {
  return (
    <section className="inner">
      <div className="shell">
        <p className="inner-kicker">از مزرعه تا خانه</p>
        <h1>مسیر غذا</h1>
        <p className="inner-lead">غذا از مرتع می‌آید، با دقت آماده می‌شود و به سفره می‌رسد.</p>
        <ol className="chain-steps">
          {valueChain.map((step, index) => (
            <li key={step.id}>
              <span>{index + 1}</span>
              {step.label}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
LLLL