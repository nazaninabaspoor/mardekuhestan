import { redirect } from "next/navigation";

/** Exact Ogenix dark template demo (static HTML + CDN assets). */
export default function OgenixDemoRedirectPage() {
  redirect("/demo-ogenix/index.html");
}
