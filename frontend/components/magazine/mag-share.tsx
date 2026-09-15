"use client";

import { useEffect, useState } from "react";

export function MagShare({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const telegram = url
    ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    : "#";

  return (
    <div className="mk-read-share">
      <p>اشتراک‌گذاری</p>
      <div>
        <button type="button" onClick={copyLink}>
          {copied ? "کپی شد" : "کپی لینک"}
        </button>
        <a href={telegram} target="_blank" rel="noreferrer">
          تلگرام
        </a>
      </div>
    </div>
  );
}
