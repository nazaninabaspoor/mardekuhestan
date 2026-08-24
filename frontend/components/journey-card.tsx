"use client";

type JourneyCardProps = {
  id: number;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  active: boolean;
  done: boolean;
  onClick: () => void;
};

export function JourneyCard({ id, title, subtitle, x, y, active, done, onClick }: JourneyCardProps) {
  return (
    <button
      type="button"
      className={`journey-card${active ? " is-active" : ""}${done ? " is-done" : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
      disabled={!active}
      aria-label={`${title}؛ ${active ? (id === 5 ? "نمایش پایان مسیر" : "حرکت به مرحله بعد") : done ? "تکمیل شده" : "قفل است"}`}
    >
      <span className="journey-card__number">{id}</span>
      <span className="journey-card__content">
        <small>{String(id).padStart(2, "0")}</small>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </span>
    </button>
  );
}
