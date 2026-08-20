from pathlib import Path

p = Path(r"c:/Users/kamyar/Desktop/MardeKoohestan/frontend/app/globals.css")
text = p.read_text(encoding="utf-8")

# Replace latest-articles block through magazine-list
la_start = text.find("\n.latest-articles {\n")
mag_start = text.find("\n.magazine-list {\n")
if la_start < 0 or mag_start < 0:
    raise SystemExit(f"latest markers {la_start} {mag_start}")

stories = r'''
.stories-shelf {
  position: relative;
  padding: 10px 0 28px;
  color: var(--green);
}

.stories-shelf-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 22px;
  align-items: start;
}

.stories-shelf-title {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 0 0 14px;
  color: var(--green);
}

.stories-shelf-title-text {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 38px;
}

.stories-shelf-title-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: var(--green);
}

.stories-shelf-title-rule {
  display: block;
  flex: 1 1 auto;
  min-width: 1.5rem;
  height: 0;
  border-bottom: 2px dotted color-mix(in srgb, var(--green) 60%, transparent);
  opacity: 0.35;
}

.stories-shelf-more {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 700;
  color: color-mix(in srgb, var(--green) 82%, #444);
}

.stories-shelf-more:hover,
.stories-shelf-more:focus-visible {
  color: var(--green);
}

.stories-shelf-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.stories-shelf-item {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
  transition:
    opacity 620ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--shelf-i, 0) * 90ms);
}

.stories-shelf.is-visible .stories-shelf-item {
  opacity: 1;
  transform: none;
}

.stories-shelf-card {
  --neon: color-mix(in srgb, var(--meadow) 78%, #9dffb0);
  --neon-core: color-mix(in srgb, var(--green) 55%, #7dffb8);
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  min-height: 100%;
  padding: 12px 12px 14px;
  border-radius: 14px;
  isolation: isolate;
  overflow: hidden;
  background:
    radial-gradient(
      ellipse 90% 70% at 50% 16%,
      color-mix(in srgb, var(--meadow) 20%, transparent) 0%,
      transparent 58%
    ),
    linear-gradient(
      165deg,
      color-mix(in srgb, var(--green) 88%, #01261c) 0%,
      var(--green) 52%,
      color-mix(in srgb, var(--green) 92%, #003528) 100%
    );
  color: var(--milk);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--milk) 14%, transparent),
    0 0 0 1px color-mix(in srgb, var(--neon) 35%, transparent),
    0 0 18px color-mix(in srgb, var(--neon-core) 40%, transparent),
    0 12px 26px rgb(0 45 36 / 16%);
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 280ms ease,
    filter 280ms ease;
}

.stories-shelf-neon {
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 0;
  box-shadow:
    inset 0 0 0 1.5px color-mix(in srgb, var(--neon) 68%, #fff),
    inset 0 0 14px color-mix(in srgb, var(--neon-core) 32%, transparent);
  opacity: 0.85;
}

.stories-shelf-neon--spin {
  inset: -40%;
  border-radius: 40%;
  background:
    conic-gradient(
      from 0deg,
      transparent 0deg,
      color-mix(in srgb, var(--meadow) 75%, #fff) 50deg,
      transparent 100deg,
      transparent 180deg,
      color-mix(in srgb, var(--green) 40%, #86c2eb) 230deg,
      transparent 290deg
    );
  opacity: 0.5;
  filter: blur(10px);
  mix-blend-mode: screen;
  animation: fresh-way-orbit 8s linear infinite;
}

.stories-shelf-card > :not(.stories-shelf-neon) {
  position: relative;
  z-index: 1;
}

.stories-shelf-card:hover,
.stories-shelf-card:focus-visible {
  transform: translateY(-5px) scale(1.015);
  filter: saturate(1.05);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--milk) 22%, transparent),
    0 0 0 1.5px color-mix(in srgb, var(--neon) 70%, #fff),
    0 0 28px color-mix(in srgb, var(--neon-core) 68%, transparent),
    0 0 46px color-mix(in srgb, var(--meadow) 32%, transparent),
    0 16px 32px rgb(0 45 36 / 22%);
}

.stories-shelf-card:hover .stories-shelf-neon--spin,
.stories-shelf-card:focus-visible .stories-shelf-neon--spin {
  opacity: 0.82;
  animation-duration: 3.6s;
}

.stories-shelf-card:focus-visible {
  outline: 2px solid var(--meadow);
  outline-offset: 4px;
}

.stories-shelf-visual {
  position: relative;
  width: 100%;
  aspect-ratio: 1.15;
  border-radius: 12px;
  overflow: hidden;
  background: color-mix(in srgb, var(--cream) 10%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--milk) 12%, transparent);
}

.stories-shelf-visual img {
  padding: 8px;
  object-fit: contain;
  transition: transform 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.stories-shelf-card:hover .stories-shelf-visual img,
.stories-shelf-card:focus-visible .stories-shelf-visual img {
  transform: scale(1.06);
}

.stories-shelf-copy {
  display: grid;
  gap: 4px;
  text-align: center;
  padding: 0 2px;
}

.stories-shelf-kicker {
  font-size: 10px;
  font-weight: 700;
  color: color-mix(in srgb, var(--neon) 70%, var(--milk));
}

.stories-shelf-copy strong {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--milk);
}

.stories-shelf-meta {
  font-size: 10px;
  color: color-mix(in srgb, var(--milk) 62%, transparent);
}

@media (max-width: 980px) {
  .stories-shelf-split {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 560px) {
  .stories-shelf-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stories-shelf-card {
    padding: 10px 8px 12px;
  }

  .stories-shelf-copy strong {
    font-size: 11.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stories-shelf-item,
  .stories-shelf-card,
  .stories-shelf-visual img {
    transition: none !important;
    animation: none !important;
  }

  .stories-shelf-neon--spin {
    animation: none !important;
    opacity: 0.3;
  }

  .stories-shelf-item {
    opacity: 1;
    transform: none;
  }
}

'''

text = text[:la_start] + stories + text[mag_start:]

# Replace footer CSS
footer_start = text.find("\n.site-footer {\n")
footer_end = text.find("\n.inner {\n", footer_start)
if footer_start < 0 or footer_end < 0:
    raise SystemExit(f"footer markers {footer_start} {footer_end}")

footer = r'''
.site-footer {
  position: relative;
  margin-top: 28px;
  background: #005040;
  color: var(--white);
  overflow: hidden;
}

.footer-mountains {
  position: relative;
  z-index: 1;
  width: 100%;
  margin: 0;
  line-height: 0;
  background: transparent;
}

.footer-mountains-svg {
  display: block;
  width: 100%;
  height: clamp(88px, 11vw, 148px);
  margin-bottom: -1px;
}

.footer-mountains-far {
  fill: #1f7a5f;
  opacity: 0.55;
}

.footer-mountains-mid {
  fill: #0d634e;
  opacity: 0.92;
}

.footer-mountains-snow {
  fill: rgb(255 255 255 / 22%);
}

.footer-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 190px minmax(0, 1.55fr) minmax(0, 0.9fr) minmax(0, 1.15fr);
  gap: 28px 36px;
  align-items: start;
  padding: 8px 0 34px;
}

.footer-col--seal {
  display: flex;
  justify-content: center;
  padding-top: 2px;
}

.footer-seal {
  display: grid;
  place-items: center;
  width: min(176px, 100%);
  filter: drop-shadow(0 10px 22px rgb(0 20 16 / 28%));
  transition: transform 240ms ease, filter 240ms ease;
}

.footer-seal:hover,
.footer-seal:focus-visible {
  transform: translateY(-3px) scale(1.03);
  filter: drop-shadow(0 0 18px rgb(80 175 71 / 38%));
}

.footer-seal-img {
  width: 100%;
  height: auto;
  display: block;
}

.footer-company {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.55;
  color: var(--white);
}

.footer-blurb {
  margin: 0;
  max-width: 32rem;
  font-size: 13px;
  line-height: 2.05;
  color: rgb(255 255 255 / 88%);
}

.footer-col-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 700;
  color: var(--white);
}

.footer-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
  font-size: 13.5px;
}

.footer-col a {
  color: rgb(255 255 255 / 90%);
}

.footer-col a:hover,
.footer-col a:focus-visible {
  color: var(--white);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.footer-col--contact address {
  font-style: normal;
  margin: 0;
  font-size: 13.5px;
  line-height: 2.05;
  color: rgb(255 255 255 / 90%);
}

.footer-col--contact address p {
  margin: 0;
}

.footer-bottom {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgb(255 255 255 / 16%);
  background: color-mix(in srgb, #003d31 55%, #005040);
}

.footer-bottom .shell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  padding: 14px 0 16px;
}

.footer-bottom p {
  margin: 0;
  max-width: 56rem;
  font-size: 12px;
  line-height: 1.7;
  text-align: center;
  color: rgb(255 255 255 / 78%);
}

@media (max-width: 980px) {
  .footer-grid {
    grid-template-columns: 150px minmax(0, 1fr) minmax(0, 1fr);
    gap: 24px;
  }

  .footer-col--contact {
    grid-column: 2 / -1;
  }
}

@media (max-width: 720px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 10px 0 26px;
    text-align: center;
  }

  .footer-col--seal {
    order: -1;
  }

  .footer-blurb {
    margin-inline: auto;
  }

  .footer-col ul {
    justify-items: center;
  }

  .footer-mountains-svg {
    height: 86px;
  }
}

@media (max-width: 640px) {
  .footer-bottom {
    padding-inline: 4px;
  }
}

'''

text = text[:footer_start] + footer + text[footer_end:]
p.write_text(text, encoding="utf-8")
print("ok", len(text))
