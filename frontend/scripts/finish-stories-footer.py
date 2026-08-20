from pathlib import Path

p = Path(r"c:/Users/kamyar/Desktop/MardeKoohestan/frontend/app/globals.css")
text = p.read_text(encoding="utf-8")

stories_start = text.find("\n.stories-shelf {\n")
if stories_start < 0:
    stories_start = text.find("\n.latest-articles {\n")
mag_start = text.find("\n.magazine-list {\n")
if stories_start < 0 or mag_start < 0:
    raise SystemExit(f"stories markers {stories_start} {mag_start}")

stories = r'''
.stories-shelf {
  position: relative;
  padding: 12px 0 32px;
  color: var(--green);
}

.stories-shelf-split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.stories-shelf-title {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 0 0 6px;
  color: var(--green);
}

.stories-shelf-title-text {
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
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  font-size: 10px;
  font-weight: 700;
  color: color-mix(in srgb, var(--green) 82%, #444);
}

.stories-shelf-more:hover,
.stories-shelf-more:focus-visible {
  color: var(--green);
}

.stories-shelf-lead {
  margin: 0 0 14px;
  max-width: 28rem;
  font-size: 12px;
  line-height: 1.75;
  color: color-mix(in srgb, var(--green) 68%, #555);
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
  transform: translateY(14px);
  transition:
    opacity 560ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 560ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--shelf-i, 0) * 80ms);
}

.stories-shelf.is-visible .stories-shelf-item {
  opacity: 1;
  transform: none;
}

/* —— Magazine: paper / editorial —— */
.stories-shelf-card--magazine {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100%;
  border-radius: 4px 4px 12px 12px;
  overflow: hidden;
  background:
    linear-gradient(
      180deg,
      #fffdf8 0%,
      color-mix(in srgb, var(--cream) 88%, #fff) 100%
    );
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--green) 12%, transparent),
    0 10px 24px rgb(0 45 36 / 7%);
  color: var(--green);
  transition:
    transform 260ms ease,
    box-shadow 260ms ease;
}

.stories-shelf-card--magazine .stories-shelf-visual {
  position: relative;
  aspect-ratio: 4 / 3;
  background: color-mix(in srgb, var(--green) 8%, var(--cream));
}

.stories-shelf-card--magazine .stories-shelf-visual::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      transparent 48%,
      rgb(0 40 30 / 28%) 100%
    );
  pointer-events: none;
}

.stories-shelf-card--magazine .stories-shelf-visual img {
  object-fit: cover;
}

.stories-shelf-card--magazine .stories-shelf-copy {
  display: grid;
  gap: 6px;
  padding: 14px 14px 16px;
  text-align: right;
  border-top: 1px solid color-mix(in srgb, var(--green) 10%, transparent);
}

.stories-shelf-card--magazine .stories-shelf-kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: color-mix(in srgb, var(--earth) 70%, var(--green));
}

.stories-shelf-card--magazine .stories-shelf-copy strong {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.55;
  color: color-mix(in srgb, var(--green) 92%, #1d1d1b);
}

.stories-shelf-card--magazine .stories-shelf-meta {
  font-size: 10.5px;
  color: color-mix(in srgb, var(--green) 55%, #666);
}

.stories-shelf-card--magazine:hover,
.stories-shelf-card--magazine:focus-visible {
  transform: translateY(-4px);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--green) 18%, transparent),
    0 16px 30px rgb(0 45 36 / 12%);
}

/* —— Catalog: lookbook / product sheet —— */
.stories-shelf-card--catalog {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: color-mix(in srgb, var(--cream) 55%, #fff);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--green) 14%, transparent),
    0 8px 20px rgb(0 45 36 / 6%);
  color: var(--green);
  transition:
    transform 260ms ease,
    box-shadow 260ms ease;
}

.stories-shelf-card--catalog .stories-shelf-visual {
  position: relative;
  aspect-ratio: 1.05;
  margin: 10px 10px 0;
  border-radius: 10px;
  background:
    radial-gradient(
      circle at 50% 40%,
      color-mix(in srgb, var(--milk) 55%, #fff) 0%,
      color-mix(in srgb, var(--cream) 70%, transparent) 100%
    );
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--green) 8%, transparent);
}

.stories-shelf-card--catalog .stories-shelf-visual img {
  padding: 10px;
  object-fit: contain;
  transition: transform 480ms cubic-bezier(0.22, 1, 0.36, 1);
}

.stories-shelf-card--catalog .stories-shelf-copy {
  display: grid;
  gap: 4px;
  padding: 12px 14px 14px;
  text-align: center;
}

.stories-shelf-card--catalog .stories-shelf-kicker {
  font-size: 10px;
  font-weight: 700;
  color: color-mix(in srgb, var(--green) 72%, transparent);
}

.stories-shelf-card--catalog .stories-shelf-copy strong {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.45;
}

.stories-shelf-card--catalog .stories-shelf-meta {
  font-size: 10px;
  color: color-mix(in srgb, var(--green) 58%, #666);
}

.stories-shelf-card--catalog:hover,
.stories-shelf-card--catalog:focus-visible {
  transform: translateY(-4px);
  box-shadow:
    inset 0 0 0 1px color-mix(in srgb, var(--green) 22%, transparent),
    0 14px 28px rgb(0 45 36 / 10%);
}

.stories-shelf-card--catalog:hover .stories-shelf-visual img,
.stories-shelf-card--catalog:focus-visible .stories-shelf-visual img {
  transform: scale(1.05);
}

.stories-shelf-card:focus-visible {
  outline: 2px solid var(--green);
  outline-offset: 3px;
}

.stories-shelf-pane--magazine {
  padding: 4px 2px 0;
}

.stories-shelf-pane--catalog {
  padding: 4px 2px 0;
}

@media (max-width: 980px) {
  .stories-shelf-split {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 560px) {
  .stories-shelf-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stories-shelf-card--magazine .stories-shelf-copy,
  .stories-shelf-card--catalog .stories-shelf-copy {
    padding: 10px 10px 12px;
  }

  .stories-shelf-card--magazine .stories-shelf-copy strong,
  .stories-shelf-card--catalog .stories-shelf-copy strong {
    font-size: 11.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stories-shelf-item,
  .stories-shelf-card--magazine,
  .stories-shelf-card--catalog,
  .stories-shelf-card--catalog .stories-shelf-visual img {
    transition: none !important;
  }

  .stories-shelf-item {
    opacity: 1;
    transform: none;
  }
}

'''

text = text[:stories_start] + stories + text[mag_start:]

footer_start = text.find("\n.site-footer {\n")
footer_end = text.find("\n.inner {\n", footer_start)
if footer_start < 0 or footer_end < 0:
    raise SystemExit(f"footer markers {footer_start} {footer_end}")

footer = r'''
.site-footer {
  position: relative;
  margin-top: 36px;
  background: #005040;
  color: var(--white);
  overflow: hidden;
}

.footer-mountains {
  position: relative;
  z-index: 1;
  width: 100%;
  line-height: 0;
  pointer-events: none;
}

.footer-mountains-svg {
  display: block;
  width: 100%;
  height: clamp(72px, 9.5vw, 118px);
  margin-bottom: -1px;
}

.footer-mountains-far {
  fill: #147a5f;
  opacity: 0.42;
}

.footer-mountains-main {
  fill: #005040;
}

.footer-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 190px minmax(0, 1.55fr) minmax(0, 0.9fr) minmax(0, 1.15fr);
  gap: 28px 40px;
  align-items: start;
  padding: 6px 0 36px;
}

.footer-col--seal {
  display: flex;
  justify-content: center;
  padding-top: 2px;
}

.footer-seal {
  display: grid;
  place-items: center;
  width: min(180px, 100%);
  filter: drop-shadow(0 12px 24px rgb(0 20 16 / 30%));
  transition: transform 240ms ease, filter 240ms ease;
}

.footer-seal:hover,
.footer-seal:focus-visible {
  transform: translateY(-3px) scale(1.03);
  filter: drop-shadow(0 0 18px rgb(80 175 71 / 32%));
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
  background: color-mix(in srgb, #003d31 50%, #005040);
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
    padding: 8px 0 28px;
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
    height: 78px;
  }
}

'''

text = text[:footer_start] + footer + text[footer_end:]
p.write_text(text, encoding="utf-8")
print("patched ok", len(text))
