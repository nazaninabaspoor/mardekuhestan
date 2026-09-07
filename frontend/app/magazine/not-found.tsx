import Link from "next/link";

import { MagMasonry } from "@/components/magazine/mag-card";
import { magazinePins } from "@/data/magazine-issue";
import { issueToPin } from "@/lib/content/magazine-feed";

export default function MagazineNotFound() {
  return (
    <div className="mk-mag-shell">
      <header className="mk-pin-head">
        <div>
          <p className="mk-mag-kicker">مجله مرد کوهستان</p>
          <h1>این صفحه روی قفسه نیست</h1>
          <p className="mk-pin-lead">شاید آدرس عوض شده. از ایده‌های پایین یکی را باز کنید.</p>
          <p style={{ marginTop: 16 }}>
            <Link href="/magazine" className="mk-mag-read">
              بازگشت به مجله
            </Link>
          </p>
        </div>
      </header>
      <MagMasonry pins={magazinePins.slice(0, 8).map(issueToPin)} />
    </div>
  );
}
