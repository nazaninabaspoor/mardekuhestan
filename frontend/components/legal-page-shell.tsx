import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageShellProps = {
  title: string;
  kicker?: string;
  children: ReactNode;
};

export function LegalPageShell({ title, kicker = "مرد کوهستان", children }: LegalPageShellProps) {
  return (
    <main className="mk-legal-page">
      <div className="shell mk-legal-inner">
        <p className="mk-legal-kicker">{kicker}</p>
        <h1>{title}</h1>
        <div className="mk-legal-body">{children}</div>
        <p className="mk-legal-back">
          <Link href="/">بازگشت به صفحهٔ اصلی</Link>
          {" · "}
          <Link href="/contact">تماس با ما</Link>
        </p>
      </div>
    </main>
  );
}
