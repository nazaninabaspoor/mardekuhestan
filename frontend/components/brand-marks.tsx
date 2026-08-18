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

export function ContourField({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="var(--earth)"
        strokeOpacity="0.07"
        strokeWidth="1"
        d="M-60 640 C 120 580, 280 700, 480 620 S 860 540, 1100 630 S 1360 570, 1520 690"
      />
      <path
        fill="none"
        stroke="var(--green)"
        strokeOpacity="0.06"
        strokeWidth="1"
        d="M40 420 C 260 350, 420 470, 620 390 S 940 310, 1180 400 S 1400 340, 1500 460"
      />
      <path
        fill="none"
        stroke="var(--earth)"
        strokeOpacity="0.05"
        strokeWidth="1"
        d="M100 260 C 320 200, 480 320, 680 240 S 1000 160, 1240 250"
      />
      <path
        fill="none"
        stroke="var(--green)"
        strokeOpacity="0.05"
        strokeWidth="1"
        d="M160 760 C 380 700, 540 820, 740 740 S 1060 660, 1300 750"
      />
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
      <defs>
        <linearGradient id="peak-warm-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbf8f2" />
          <stop offset="100%" stopColor="var(--cream)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#peak-warm-fill)"
        d="M0 140 L0 92 L180 48 L310 78 L480 18 L640 70 L790 36 L960 88 L1120 40 L1280 74 L1440 28 L1440 140 Z"
      />
      <path
        fill="none"
        stroke="var(--green)"
        strokeOpacity="0.18"
        strokeWidth="1.1"
        d="M0 96 L170 54 L300 82 L470 24 L630 74 L780 42 L950 92 L1110 46 L1270 78 L1440 34"
      />
      <path
        fill="none"
        stroke="var(--green)"
        strokeOpacity="0.1"
        strokeWidth="1"
        d="M0 108 L140 72 L280 98 L430 38 L590 86 L740 52 L910 102 L1060 58 L1210 88 L1440 48"
      />
      <path
        fill="none"
        stroke="var(--earth)"
        strokeOpacity="0.08"
        strokeWidth="1"
        d="M0 118 L200 84 L360 104 L520 56 L700 94 L880 64 L1050 108 L1220 72 L1440 62"
      />
    </svg>
  );
}
