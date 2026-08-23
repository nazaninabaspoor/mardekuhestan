from pathlib import Path

p = Path(r"c:\Users\kamyar\Desktop\MardeKoohestan\frontend\app\globals.css")
text = p.read_text(encoding="utf-8")

start = text.find("/* Catalog — glass case:")
if start < 0:
    raise SystemExit("start missing")
end = text.find(".for-home-block-content {")
if end < 0:
    raise SystemExit("end missing")

new = r'''/* Catalog — liquid glass: nav chrome over mountain, content primary */
.for-home--catalog {
  --lg-cream: rgb(244 240 232);
  --lg-edge: rgb(255 255 255 / 72%);
  --lg-ink: var(--green);
  isolation: isolate;
  padding: 22px 0 36px;
}

.for-home-case {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 16px 16px 18px;
  border-radius: 24px;
  color: var(--lg-ink);
  /* clear liquid glass — tinted cream, not milky slab */
  background:
    linear-gradient(
      165deg,
      rgb(255 255 255 / 34%) 0%,
      rgb(244 240 232 / 18%) 42%,
      rgb(255 255 255 / 12%) 100%
    );
  border: 1px solid var(--lg-edge);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 88%),
    inset 0 -1px 0 rgb(0 45 36 / 4%),
    0 1px 0 rgb(255 255 255 / 35%),
    0 24px 56px rgb(0 40 32 / 12%);
  backdrop-filter: blur(40px) saturate(1.35);
  -webkit-backdrop-filter: blur(40px) saturate(1.35);
  transform: translateZ(0);
}

.for-home-case-shine {
  position: absolute;
  inset: 0 0 auto;
  height: 42%;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 38%) 0%,
    rgb(255 255 255 / 8%) 48%,
    transparent 100%
  );
  border-radius: 24px 24px 40% 40%;
  opacity: 0.85;
}

.for-home-case::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 48% 36% at 88% 8%,
      color-mix(in srgb, var(--meadow) 7%, transparent) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse 40% 30% at 8% 90%,
      color-mix(in srgb, var(--earth) 5%, transparent) 0%,
      transparent 72%
    );
}

.for-home-case > *:not(.for-home-case-shine) {
  position: relative;
  z-index: 1;
}

.for-home-case-glow,
.for-home-case-frame,
.for-home-decor,
.for-home-rail {
  display: none !important;
}

/* Head — quiet brand chrome */
.for-home-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  margin-bottom: 14px;
  padding: 0 2px;
}

.for-home-head-copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.for-home-peak {
  width: 13px;
  height: 9px;
  flex-shrink: 0;
  color: var(--green);
  opacity: 0.88;
}

.for-home-title {
  margin: 0;
  font-size: clamp(17px, 2vw, 22px);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--green);
  text-wrap: balance;
}

.for-home-all {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / 55%);
  background: rgb(255 255 255 / 28%);
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--green);
  text-decoration: none;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 70%),
    0 4px 12px rgb(0 40 32 / 6%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    background 180ms ease,
    border-color 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.for-home-all:hover,
.for-home-all:focus-visible {
  background: var(--green);
  border-color: var(--green);
  color: var(--cream);
  box-shadow: 0 6px 14px rgb(0 45 36 / 16%);
  transform: translateY(-1px);
}

.for-home-all:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--green) 45%, transparent);
  outline-offset: 3px;
}

/* Stage — content-first proportions */
.for-home--catalog .for-home-stage {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 16px 20px;
  align-items: center;
  min-height: 0;
}

/* Single liquid-glass nav shell: cats | products */
.for-home-nav {
  display: grid;
  grid-template-columns: minmax(118px, 136px) 1px minmax(168px, 200px);
  align-items: stretch;
  gap: 0;
  min-width: 0;
  padding: 6px;
  border-radius: 18px;
  background:
    linear-gradient(
      160deg,
      rgb(255 255 255 / 46%) 0%,
      rgb(244 240 232 / 28%) 100%
    );
  border: 1px solid rgb(255 255 255 / 62%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 80%),
    inset 0 0 0 1px rgb(255 255 255 / 20%),
    0 10px 28px rgb(0 40 32 / 8%);
  backdrop-filter: blur(22px) saturate(1.2);
  -webkit-backdrop-filter: blur(22px) saturate(1.2);
}

.for-home-nav-split {
  width: 1px;
  margin-block: 8px;
  background: linear-gradient(
    180deg,
    transparent 0%,
    color-mix(in srgb, var(--green) 14%, transparent) 20%,
    color-mix(in srgb, var(--green) 14%, transparent) 80%,
    transparent 100%
  );
}

.for-home-cats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  max-height: min(380px, 58vh);
  overflow-y: auto;
  padding: 4px;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--green) 18%, transparent) transparent;
}

.for-home-cat {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  font-family: inherit;
  text-align: right;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
}

.for-home-cat-label {
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: color-mix(in srgb, var(--green) 78%, #2a2a2a);
  white-space: nowrap;
}

.for-home-cat-line {
  display: none;
}

.for-home-cat:hover,
.for-home-cat:focus-visible {
  background: rgb(255 255 255 / 48%);
}

.for-home-cat:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--green) 40%, transparent);
  outline-offset: 1px;
}

.for-home-cat.is-active {
  background: var(--green);
  border-color: var(--green);
  box-shadow:
    0 4px 12px rgb(0 45 36 / 18%),
    inset 0 1px 0 rgb(255 255 255 / 16%);
}

.for-home-cat.is-active .for-home-cat-label {
  color: var(--cream);
}

.for-home--catalog .for-home-products {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: min(380px, 58vh);
  overflow-y: auto;
  padding: 4px 4px 4px 6px;
  animation: for-home-panel-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--green) 18%, transparent) transparent;
}

@keyframes for-home-panel-in {
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.for-home-products-caption {
  margin: 0 4px 4px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  line-height: 1.2;
  color: color-mix(in srgb, var(--green) 48%, var(--earth));
}

.for-home--catalog .for-home-products::-webkit-scrollbar,
.for-home-cats::-webkit-scrollbar {
  width: 3px;
}

.for-home--catalog .for-home-products::-webkit-scrollbar-thumb,
.for-home-cats::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--green) 20%, transparent);
}

.for-home-product-card {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 7px;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 4px 8px 4px 4px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  text-align: right;
  cursor: pointer;
  font-family: inherit;
  color: var(--green);
  opacity: 0;
  transform: translateX(6px);
  animation: for-home-card-in 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--fh-i, 0) * 26ms);
  transition:
    background 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
}

@keyframes for-home-card-in {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.for-home-product-card:hover,
.for-home-product-card:focus-visible {
  background: rgb(255 255 255 / 42%);
  border-color: rgb(255 255 255 / 40%);
}

.for-home-product-card:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--green) 40%, transparent);
  outline-offset: 1px;
}

.for-home-product-card.is-active {
  background: rgb(255 252 247 / 78%);
  border-color: color-mix(in srgb, var(--green) 12%, transparent);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 70%),
    0 4px 12px rgb(0 40 32 / 7%);
}

.for-home-product-card-media {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  background: rgb(255 255 255 / 55%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--green) 8%, transparent);
}

.for-home-product-card.is-active .for-home-product-card-media {
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--green) 22%, transparent);
}

.for-home-product-card-media img {
  width: 84%;
  height: 84%;
  object-fit: contain;
  filter: drop-shadow(0 2px 3px rgb(0 20 16 / 12%));
  transition: transform 220ms ease;
}

.for-home-product-card:hover .for-home-product-card-media img,
.for-home-product-card.is-active .for-home-product-card-media img {
  transform: scale(1.05);
}

.for-home-product-card-body {
  display: grid;
  gap: 1px;
  min-width: 0;
}

.for-home-product-card-body strong {
  font-size: 11.5px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.for-home-product-card-body em {
  font-size: 9.5px;
  font-style: normal;
  font-weight: 600;
  line-height: 1.3;
  color: color-mix(in srgb, var(--green) 48%, #666);
}

.for-home-product-card.is-active .for-home-product-card-body em {
  color: color-mix(in srgb, var(--green) 55%, var(--earth));
}

/* Showcase — content layer (plate primary) */
.for-home--catalog .for-home-showcase {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(180px, 220px);
  gap: 14px 18px;
  align-items: center;
  justify-items: center;
  min-height: 0;
  padding: 0 4px;
}

.for-home-plate {
  position: relative;
  z-index: 1;
  width: min(100%, 300px);
  margin: 0;
  animation: for-home-showcase-in 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.for-home-plate::before {
  content: "";
  position: absolute;
  inset: 18% 14% 22%;
  z-index: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--green) 8%, transparent) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.for-home-plate-art {
  position: relative;
  z-index: 1;
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 18px 28px rgb(0 28 22 / 20%));
}

@keyframes for-home-showcase-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.for-home-teaser-wrap {
  display: grid;
  gap: 10px;
  justify-items: stretch;
  width: min(100%, 220px);
  animation: for-home-showcase-in 380ms cubic-bezier(0.22, 1, 0.36, 1) 50ms both;
}

/* Stabilized plate for copy — not raw glass */
.for-home-teaser {
  display: grid;
  gap: 5px;
  width: 100%;
  margin: 0;
  padding: 12px 12px 10px;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: 14px;
  background:
    linear-gradient(
      165deg,
      rgb(255 252 247 / 82%) 0%,
      rgb(244 240 232 / 72%) 100%
    );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 85%),
    0 8px 20px rgb(0 40 32 / 8%);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  text-align: center;
  cursor: pointer;
  font-family: inherit;
  color: var(--green);
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.for-home-teaser:hover,
.for-home-teaser:focus-visible {
  transform: translateY(-1px);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 90%),
    0 12px 24px rgb(0 40 32 / 11%);
}

.for-home-teaser:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--green) 40%, transparent);
  outline-offset: 2px;
}

.for-home-teaser-meta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 5px;
}

.for-home-teaser-door,
.for-home-teaser-kicker {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.05em;
  line-height: 1;
  color: color-mix(in srgb, var(--green) 55%, var(--earth));
}

.for-home-teaser-peak {
  width: 9px;
  height: 6px;
  color: var(--green);
  opacity: 0.7;
}

.for-home-teaser-name {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.for-home-teaser-text {
  margin: 0;
  font-size: 11.5px;
  font-weight: 400;
  line-height: 1.65;
  color: color-mix(in srgb, var(--green) 68%, #4a4a4a);
  text-wrap: pretty;
}

.for-home-teaser-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 2px;
  padding-top: 7px;
  border-top: 1px solid color-mix(in srgb, var(--green) 10%, transparent);
  font-size: 10.5px;
  font-weight: 800;
  color: var(--green);
}

.for-home-teaser-cta::after {
  content: "←";
  font-size: 11px;
  transition: transform 150ms ease;
}

.for-home-teaser:hover .for-home-teaser-cta::after,
.for-home-teaser:focus-visible .for-home-teaser-cta::after {
  transform: translateX(-3px);
}

/* Solid brand CTA — not glass */
.for-home-shop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 34px;
  margin: 0;
  padding: 0 14px;
  border-radius: 999px;
  border: none;
  background: var(--green);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--cream);
  text-decoration: none;
  box-shadow:
    0 8px 18px rgb(0 45 36 / 16%),
    inset 0 1px 0 rgb(255 255 255 / 14%);
  transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;
}

.for-home-shop:hover,
.for-home-shop:focus-visible {
  transform: translateY(-1px);
  filter: brightness(1.04);
  box-shadow: 0 10px 22px rgb(0 45 36 / 20%);
}

.for-home-shop:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--meadow) 55%, var(--green));
  outline-offset: 3px;
}

.for-home-shop:active {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgb(0 45 36 / 14%);
}

/* Popup */
.for-home--catalog .for-home-popup {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: grid;
  place-items: center;
  padding: 20px 16px;
  background: rgb(0 36 28 / 40%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: for-home-modal-bg 260ms ease forwards;
}

@keyframes for-home-modal-bg {
  from { opacity: 0; }
  to { opacity: 1; }
}

.for-home--catalog .for-home-popup-panel {
  position: relative;
  display: grid;
  gap: 9px;
  justify-items: center;
  width: min(100%, 360px);
  max-height: min(88vh, 540px);
  overflow-y: auto;
  padding: 22px 20px 18px;
  border-radius: 20px;
  border: 1px solid rgb(255 255 255 / 60%);
  background:
    linear-gradient(
      165deg,
      rgb(255 255 255 / 78%) 0%,
      rgb(244 240 232 / 74%) 100%
    );
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 85%),
    0 28px 56px rgb(0 28 22 / 22%);
  backdrop-filter: blur(24px) saturate(1.15);
  -webkit-backdrop-filter: blur(24px) saturate(1.15);
  color: var(--green);
  text-align: center;
  animation: for-home-modal-panel 340ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes for-home-modal-panel {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.for-home--catalog .for-home-popup-panel::before {
  content: none;
}

.for-home-popup-close {
  position: absolute;
  top: 10px;
  left: 10px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid color-mix(in srgb, var(--green) 12%, transparent);
  border-radius: 999px;
  background: rgb(255 255 255 / 55%);
  color: var(--green);
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
}

.for-home-popup-close:hover,
.for-home-popup-close:focus-visible {
  background: var(--green);
  color: var(--cream);
}

.for-home-popup-media {
  width: 140px;
  height: 140px;
  display: grid;
  place-items: center;
}

.for-home-popup-media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 10px 16px rgb(0 28 22 / 14%));
}

.for-home-popup-kicker {
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: color-mix(in srgb, var(--green) 58%, var(--earth));
}

.for-home-popup-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.for-home-popup-story {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.75;
  color: color-mix(in srgb, var(--green) 70%, #4a4a4a);
  text-wrap: pretty;
}

.for-home-popup-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  margin-top: 4px;
  padding: 0 18px;
  border-radius: 999px;
  background: var(--green);
  color: var(--cream);
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 8px 18px rgb(0 45 36 / 14%);
  transition: transform 150ms ease, filter 150ms ease;
}

.for-home-popup-cta:hover,
.for-home-popup-cta:focus-visible {
  transform: translateY(-1px);
  filter: brightness(1.04);
}

@media (max-width: 1100px) {
  .for-home-nav {
    grid-template-columns: minmax(108px, 124px) 1px minmax(150px, 176px);
  }

  .for-home--catalog .for-home-showcase {
    grid-template-columns: minmax(0, 1fr) minmax(160px, 190px);
    gap: 12px;
  }

  .for-home-plate {
    width: min(100%, 260px);
  }

  .for-home-teaser-wrap {
    width: min(100%, 190px);
  }
}

@media (max-width: 900px) {
  .for-home--catalog .for-home-stage {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .for-home-nav {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .for-home-nav-split {
    width: auto;
    height: 1px;
    margin: 4px 8px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--green) 14%, transparent) 20%,
      color-mix(in srgb, var(--green) 14%, transparent) 80%,
      transparent 100%
    );
  }

  .for-home-cats {
    flex-direction: row;
    flex-wrap: wrap;
    max-height: none;
    gap: 4px;
  }

  .for-home-cat {
    width: auto;
    flex: 0 1 auto;
    min-height: 28px;
    padding: 0 11px;
  }

  .for-home--catalog .for-home-products {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
    max-height: none;
    animation: none;
  }

  .for-home-products-caption {
    grid-column: 1 / -1;
  }

  .for-home--catalog .for-home-showcase {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .for-home-teaser-wrap {
    width: min(100%, 280px);
  }
}

@media (max-width: 480px) {
  .for-home-case {
    padding: 14px 12px 14px;
    border-radius: 18px;
  }

  .for-home-cat {
    flex: 1 1 calc(50% - 4px);
    justify-content: center;
  }

  .for-home--catalog .for-home-products {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .for-home-case,
  .for-home-nav,
  .for-home-teaser,
  .for-home-all,
  .for-home--catalog .for-home-popup-panel {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .for-home-case {
    background: color-mix(in srgb, var(--cream) 92%, var(--white));
  }

  .for-home-nav {
    background: color-mix(in srgb, var(--cream) 88%, var(--white));
  }
}

@media (prefers-reduced-motion: reduce) {
  .for-home-product-card,
  .for-home-plate,
  .for-home-teaser-wrap,
  .for-home--catalog .for-home-products,
  .for-home--catalog .for-home-popup,
  .for-home--catalog .for-home-popup-panel {
    animation: none !important;
  }

  .for-home-product-card {
    opacity: 1;
    transform: none;
  }
}

'''

text = text[:start] + new + text[end:]
p.write_text(text, encoding="utf-8")
print("liquid glass css applied")
