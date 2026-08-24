import Image from "next/image";

type StageObjectProps = {
  src: string;
  x: number;
  y: number;
  active: boolean;
  done: boolean;
};

export function StageObject({ src, x, y, active, done }: StageObjectProps) {
  return (
    <div
      className={`stage-object${active ? " is-active" : ""}${done ? " is-done" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-hidden="true"
    >
      <Image src={src} alt="" width={130} height={150} sizes="130px" />
    </div>
  );
}
