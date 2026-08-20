from pathlib import Path
import re

html = Path(r"C:/Users/kamyar/AppData/Local/Temp/mk2.html").read_text(
    encoding="utf-8", errors="ignore"
)
i = html.find("elementor-location-footer")
chunk = html[i : i + 90000]
urls = re.findall(
    r'(?:data-src|src)="(https://mardekuhestan.com/wp-content/uploads/[^"]+)"',
    chunk,
)
Path(r"C:/Users/kamyar/AppData/Local/Temp/mk-footer-urls.txt").write_text(
    "\n".join(dict.fromkeys(urls)), encoding="utf-8"
)
print("urls", len(urls))
for u in dict.fromkeys(urls):
    print(u)
