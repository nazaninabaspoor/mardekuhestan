from pathlib import Path
import re
import urllib.request

html_path = Path.home() / "AppData/Local/Temp/mk3.html"
out_dir = Path(__file__).resolve().parents[1] / "public" / "brand"

try:
    urllib.request.urlretrieve(
        "https://mardekuhestan.com/",
        html_path,
    )
except Exception as e:
    print("fetch home failed", e)

html = html_path.read_text(encoding="utf-8", errors="ignore") if html_path.exists() else ""
urls = sorted(
    set(
        re.findall(
            r"https://mardekuhestan.com/wp-content/uploads/[^\"']+\.(?:png|svg|jpg|webp)",
            html,
        )
    )
)
keys = ("footer", "mountain", "logo", "seal", "peak", "mount", "ridge", "skyline")
for u in urls:
    low = u.lower()
    if any(k in low for k in keys):
        print(u)

# try common footer mountain asset names
candidates = [
    "https://mardekuhestan.com/wp-content/uploads/2025/11/mardekoohestan-logo-white.svg",
    "https://mardekuhestan.com/wp-content/uploads/2025/12/cropped-web-app-manifest-512x512-1-512x512.png",
]
for u in candidates:
    name = u.rsplit("/", 1)[-1]
    dest = out_dir / ("footer-" + name)
    try:
        urllib.request.urlretrieve(u, dest)
        print("saved", dest, dest.stat().st_size)
    except Exception as e:
        print("fail", u, e)
