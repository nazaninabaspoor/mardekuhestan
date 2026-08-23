# -*- coding: utf-8 -*-
from pathlib import Path

path = Path(r"c:\Users\kamyar\Desktop\MardeKoohestan\frontend\app\globals.css")
text = path.read_text(encoding="utf-8")

replacements = [
    (
        """.for-home-product-card-pick {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 800;
  color: var(--meadow);
}""",
        """.for-home-product-card-pick {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 800;
  color: var(--meadow);
  opacity: 0.72;
  transition: opacity 160ms ease;
}

.for-home-product-card:hover .for-home-product-card-pick,
.for-home-product-card.is-active .for-home-product-card-pick {
  opacity: 1;
}""",
    ),
    (
        """.for-home-teaser-name-soft {
  display: none;
}

.for-home-teaser-name-accent {
  color: var(--cream);
  font-weight: 800;
}

""",
        "",
    ),
    (
        """.for-home-plate-badge {
  position: absolute;
  z-index: 2;
  top: 9%;
  right: 5%;
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background: rgb(244 240 232 / 88%);
  border: 2px solid rgb(255 255 255 / 72%);
  box-shadow: 0 8px 18px rgb(0 16 12 / 22%);
}""",
        """.for-home-plate-badge {
  position: absolute;
  z-index: 2;
  top: 8%;
  right: 4%;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--cream);
  border: 2px solid rgb(255 255 255 / 80%);
  box-shadow: 0 10px 22px rgb(0 16 12 / 24%);
}""",
    ),
    (
        """.for-home-shop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 44px;
  padding: 0 22px;
  border-radius: 999px;
  border: none;
  background: var(--meadow);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--white);
  text-decoration: none;
  box-shadow: 0 14px 32px rgb(80 175 71 / 38%);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    filter 160ms ease;
}""",
        """.for-home-shop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 180px;
  min-height: 46px;
  margin-inline: auto;
  padding: 0 28px;
  border-radius: 999px;
  border: none;
  background: var(--meadow);
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--white);
  text-decoration: none;
  box-shadow: 0 14px 32px rgb(80 175 71 / 40%);
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    filter 160ms ease;
}""",
    ),
]

for old, new in replacements:
    if old not in text:
        print("MISS:", old[:60].replace("\n", " "))
    else:
        text = text.replace(old, new, 1)
        print("OK:", old[:40].replace("\n", " "))

path.write_text(text, encoding="utf-8")
print("done")
