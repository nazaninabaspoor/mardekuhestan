"use client";

import { useEffect, useState } from "react";

function faCount(n: number) {
  return n.toLocaleString("fa-IR");
}

export function MagReadMood({ slug }: { slug: string }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(window.localStorage.getItem(`mk-mag-heart:${slug}`) === "1");
  }, [slug]);

  function toggle() {
    setLiked((current) => {
      const next = !current;
      window.localStorage.setItem(`mk-mag-heart:${slug}`, next ? "1" : "0");
      return next;
    });
  }

  return (
    <li>
      <button
        type="button"
        className="mk-read-mood"
        onClick={toggle}
        aria-pressed={liked}
        aria-label={liked ? "برداشتن پسند" : "پسندیدن مقاله"}
      >
        <span className="mk-read-emo" aria-hidden="true">
          {liked ? "💚" : "🤍"}
        </span>
        {faCount(liked ? 1 : 0)}
      </button>
    </li>
  );
}
