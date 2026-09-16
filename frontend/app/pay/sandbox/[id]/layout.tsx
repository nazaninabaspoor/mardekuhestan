import type { ReactNode } from "react";

export function generateStaticParams() {
  // درگاه پرداخت داینامیک است؛ یک مسیر ثابت برای سازگاری با static export
  return [{ id: "_" }];
}

export default function SandboxPayLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
