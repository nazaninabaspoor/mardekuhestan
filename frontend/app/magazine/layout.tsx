import "./magazine.css";

import { MagRouteClass } from "@/components/magazine/mag-chrome";

export default function MagazineLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MagRouteClass />
      <div className="mk-mag">{children}</div>
    </>
  );
}
