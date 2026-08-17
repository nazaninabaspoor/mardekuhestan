import Image from "next/image";

export function BrandLogo({
  className,
  size = 200,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      className={className}
      src="/brand/orginal-clear.png"
      alt="مرد کوهستان"
      width={size}
      height={size}
      priority={priority}
      style={{ width: "100%", height: "auto" }}
    />
  );
}
