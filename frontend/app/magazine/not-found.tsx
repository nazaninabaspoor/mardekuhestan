import Link from "next/link";

import { MagMasonry } from "@/components/magazine/mag-card";
import { magazinePins } from "@/data/magazine-issue";
import { issueToPin } from "@/lib/content/magazine-feed";

export default function MagazineNotFound() {
  return (
    <div className="mk-mag-shell" style={{ paddingTop: 28 }}>
      <p style={{ textAlign: "center", marginBottom: 18 }}>
        <Link href="/magazine" className="mk-mag-read">
          بازگشت به دیوار مجله
        </Link>
      </p>
      <MagMasonry pins={magazinePins.slice(0, 10).map(issueToPin)} />
    </div>
  );
}
