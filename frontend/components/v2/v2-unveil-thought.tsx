"use client";

import { useEffect, useState, type MutableRefObject } from "react";

import { useAuth } from "@/lib/auth-context";
import { registerWaitlist } from "@/lib/api/assistant";

import {
  UNVEIL_FUTURE_PRODUCTS,
  UNVEIL_WATCH_KEY,
  isUnveilTalking,
  type UnveilManState,
} from "./v2-unveil-shared";
import styles from "./v2-unveil-section.module.css";

function readWatchList() {
  try {
    const raw = window.localStorage.getItem(UNVEIL_WATCH_KEY);
    if (!raw) return {} as Record<string, boolean>;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {} as Record<string, boolean>;
  }
}

export function UnveilMobileTalk({ man }: { man: MutableRefObject<UnveilManState> }) {
  const { user, openLoginModal } = useAuth();
  const [talk, setTalk] = useState({ open: false, slot: 0 });
  const [watched, setWatched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setWatched(readWatchList());
  }, []);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const state = man.current;
      const open = isUnveilTalking(state);
      const slot = state.slot;
      setTalk((prev) => (prev.open === open && prev.slot === slot ? prev : { open, slot }));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [man]);

  const product = UNVEIL_FUTURE_PRODUCTS[talk.slot];
  const saved = Boolean(product && watched[product.id]);

  return (
    <div
      className={`v2-unveil-talk-mobile ${styles.mobileTalk}`}
      data-open={talk.open ? "true" : "false"}
      aria-hidden={talk.open ? undefined : true}
    >
      {product ? (
        <div
          className={styles.mobileTalkBubble}
          style={{ ["--slot" as string]: String(talk.slot) }}
          dir="rtl"
        >
          <p>{saved ? "باشه، یادم می‌ماند." : product.invite}</p>
          {saved ? (
            <span className={styles.thoughtSaved}>یادم ماند</span>
          ) : (
            <button
              type="button"
              className={styles.thoughtCta}
              onClick={(event) => {
                event.stopPropagation();
                if (!user) {
                  openLoginModal({ next: "/#product-unveil" });
                  return;
                }
                const next = { ...readWatchList(), [product.id]: true };
                setWatched(next);
                try {
                  window.localStorage.setItem(UNVEIL_WATCH_KEY, JSON.stringify(next));
                } catch {
                  /* ignore */
                }
                void registerWaitlist({
                  product_key: product.id,
                  product_name: product.name,
                  source: "product-unveil",
                }).catch(() => {
                  /* UI already optimistic */
                });
              }}
            >
              خبرم کن
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
