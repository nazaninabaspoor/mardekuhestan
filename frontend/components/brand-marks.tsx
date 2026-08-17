export function PeakMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 16"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="12,1 23,15 1,15" fill="currentColor" />
    </svg>
  );
}

export function MountainPattern() {
  return (
    <svg
      className="hero-peaks"
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="var(--cream)"
        d="M0 140 L0 92 L180 48 L310 78 L480 18 L640 70 L790 36 L960 88 L1120 40 L1280 74 L1440 28 L1440 140 Z"
      />
      <path
        fill="none"
        stroke="var(--green-primary)"
        strokeOpacity="0.22"
        strokeWidth="1.25"
        d="M0 96 L170 54 L300 82 L470 24 L630 74 L780 42 L950 92 L1110 46 L1270 78 L1440 34"
      />
    </svg>
  );
}
