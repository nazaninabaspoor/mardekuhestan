import Link from "next/link";

export default function NotFound() {
  return (
    <section className="inner">
      <div className="shell">
        <h1>این صفحه پیدا نشد</h1>
        <p className="inner-lead">برگردید به خانه و راه سبز را از آنجا شروع کنید.</p>
        <Link href="/" className="btn-primary">
          خانه
        </Link>
      </div>
    </section>
  );
}
