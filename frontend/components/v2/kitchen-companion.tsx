"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { ShowcaseProduct } from "@/components/product-showcase/ProductCard";
import { submitProductOpinion, trackProductInsight } from "@/lib/api/insights";
import { useCart } from "@/lib/cart-context";
import {
  companionLine,
  relatedKitchenProducts,
  type KitchenCompanionSeed,
} from "@/lib/catalog/kitchen-companions";

import styles from "./kitchen-companion.module.css";

const MEALS = [
  { id: "breakfast", label: "صبحانه" },
  { id: "lunch", label: "ناهار" },
  { id: "dinner", label: "شام" },
  { id: "gathering", label: "مهمانی" },
] as const;

type KitchenCompanionProps = {
  seed: KitchenCompanionSeed;
  productsByCategory: Record<string, ShowcaseProduct[]>;
  onClose: () => void;
  onFocusProduct: (product: ShowcaseProduct) => void;
};

export function KitchenCompanion({
  seed,
  productsByCategory,
  onClose,
  onFocusProduct,
}: KitchenCompanionProps) {
  const { addToCart } = useCart();
  const related = useMemo(
    () => relatedKitchenProducts(seed, productsByCategory),
    [seed, productsByCategory],
  );
  const fullLine = useMemo(
    () => companionLine(seed.name, seed.categoryId),
    [seed.name, seed.categoryId],
  );
  const [typed, setTyped] = useState("");
  const [rating, setRating] = useState(0);
  const [meal, setMeal] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    setTyped("");
    setRating(0);
    setMeal("");
    setComment("");
    setSent(false);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(fullLine.slice(0, index));
      if (index >= fullLine.length) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [fullLine, seed.id]);

  const addRelated = async (product: ShowcaseProduct) => {
    setAddingId(product.id);
    const result = await addToCart({
      product_id: product.id,
      product_name: product.name,
      product_image: product.image,
      portion: "۱ کیلوگرم",
      cut_type: "سهمیه تازه مرتع",
      unit_price_toman: 480000,
      quantity: 1,
    });
    setAddingId(null);
    if (!result.success) return;
    void trackProductInsight({
      event_type: "related_add",
      product_key: seed.id,
      product_name: seed.name,
      category_key: seed.categoryId,
      payload: { related_key: product.id, related_name: product.name, source: "companion" },
    });
  };

  const submitOpinion = async () => {
    if (!rating || sending) return;
    setSending(true);
    const ok = await submitProductOpinion({
      product_key: seed.id,
      product_name: seed.name,
      category_key: seed.categoryId,
      rating,
      meal,
      comment,
    });
    if (ok) {
      setSent(true);
      void trackProductInsight({
        event_type: "opinion_submit",
        product_key: seed.id,
        product_name: seed.name,
        category_key: seed.categoryId,
        payload: { rating: String(rating), meal },
      });
    }
    setSending(false);
  };

  return (
    <section className={styles.root} id="kitchen-companion" aria-label="پیشنهاد مسیر سفره">
      <header className={styles.head}>
        <p className={styles.kicker}>مسیر سبز کنار سبد</p>
        <h3>کنار «{seed.name}» معمولاً این‌ها هم روی سفره می‌آید</h3>
        <button type="button" className={styles.close} onClick={onClose} aria-label="بستن پیشنهاد">
          بستن
        </button>
      </header>

      <p className={styles.line} aria-live="polite">
        {typed}
        {typed.length < fullLine.length ? <span className={styles.caret} aria-hidden="true" /> : null}
      </p>

      {related.length ? (
        <ul className={styles.related}>
          {related.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                className={styles.card}
                onClick={() => {
                  onFocusProduct(product);
                  void trackProductInsight({
                    event_type: "related_click",
                    product_key: seed.id,
                    product_name: seed.name,
                    category_key: seed.categoryId,
                    payload: { related_key: product.id, related_name: product.name },
                  });
                }}
              >
                <span className={styles.thumb}>
                  <Image src={product.image} alt="" width={88} height={88} />
                </span>
                <strong>{product.name}</strong>
              </button>
              <button
                type="button"
                className={styles.add}
                disabled={addingId === product.id}
                onClick={() => void addRelated(product)}
              >
                {addingId === product.id ? "در حال ثبت…" : "افزودن به سبد"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        className={styles.survey}
        onSubmit={(event) => {
          event.preventDefault();
          void submitOpinion();
        }}
      >
        <p className={styles.surveyTitle}>نظر شما درباره «{seed.name}»</p>
        <div className={styles.stars} role="group" aria-label="امتیاز">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={value <= rating ? styles.starOn : styles.star}
              onClick={() => setRating(value)}
              aria-label={`${value} از ۵`}
            >
              ★
            </button>
          ))}
        </div>
        <div className={styles.meals} role="group" aria-label="برای چه وعده‌ای">
          {MEALS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={meal === item.id ? styles.mealOn : styles.meal}
              onClick={() => setMeal(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <textarea
          className={styles.comment}
          rows={3}
          maxLength={800}
          placeholder="اگر نکته‌ای از طعم یا سفره خانه دارید، همین‌جا بنویسید."
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
        <button type="submit" className={styles.submit} disabled={!rating || sending || sent}>
          {sent ? "نظر ثبت شد" : sending ? "در حال ثبت…" : "ثبت نظر"}
        </button>
      </form>
    </section>
  );
}
