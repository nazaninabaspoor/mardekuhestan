from PIL import Image
from collections import deque
from pathlib import Path

root = Path(r"c:\Users\kamyar\Desktop\MardeKoohestan\frontend\public\brand")
files = [
    "our-way-01-climb.png",
    "our-way-02-nature.png",
    "our-way-03-quality.png",
    "our-way-04-balance.png",
    "our-way-05-ahead.png",
]


def flood_key_color(im: Image.Image, key_rgb: tuple[int, int, int], tol: int = 28, soft: int = 20) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    kr, kg, kb = key_rgb
    visited = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()

    def dist(x: int, y: int) -> int:
        r, g, b, _a = px[x, y]
        return max(abs(r - kr), abs(g - kg), abs(b - kb))

    def is_bg(x: int, y: int) -> bool:
        return dist(x, y) <= tol

    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))

    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
            continue
        visited[y][x] = True
        if not is_bg(x, y):
            continue
        r, g, b, _a = px[x, y]
        d = dist(x, y)
        if d <= max(0, tol - soft):
            alpha = 0
        else:
            alpha = int(255 * (d - (tol - soft)) / soft)
            alpha = max(0, min(255, alpha))
        px[x, y] = (r, g, b, alpha)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im


def corner_key(im: Image.Image) -> tuple[int, int, int]:
    px = im.convert("RGBA").load()
    w, h = im.size
    samples = [px[0, 0], px[w - 1, 0], px[w // 2, 0], px[0, h // 2]]
    # pick the most common-ish: average of light or dark corners
    avg = tuple(sum(c[i] for c in samples) // len(samples) for i in range(3))
    return avg  # type: ignore[return-value]


for name in files:
    path = root / name
    # restore from cursor assets if needed — process current file
    im = Image.open(path)
    key = corner_key(im)
    # If already mostly transparent black-cleared, also clear light if corners are light
    if max(key) >= 180:
        out = flood_key_color(im, key, tol=36, soft=22)
    elif max(key) <= 40:
        out = flood_key_color(im, (0, 0, 0), tol=30, soft=18)
    else:
        # try both black and light gray
        out = flood_key_color(im, (0, 0, 0), tol=30, soft=18)
        out = flood_key_color(out, (245, 245, 245), tol=40, soft=24)

    out.save(path, optimize=True)
    data = list(out.getdata())
    total = len(data)
    clear = sum(1 for p in data if p[3] == 0)
    print(name, "key", key, f"clear={round(clear / total * 100, 1)}%")
