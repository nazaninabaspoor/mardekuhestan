"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

import styles from "./ProductCards.module.css";

export type ShowcaseProduct = {
  id: string;
  name: string;
  href: string;
  image: string;
  alt: string;
};

type ProductCardProps = {
  product: ShowcaseProduct;
  highlighted?: boolean;
  onClick?: (product: ShowcaseProduct) => void;
};

export function ProductCard({
  product,
  highlighted = false,
  onClick,
}: ProductCardProps) {
  const reduceMotion = useReducedMotion();

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(product);
    }
  };

  return (
    <motion.div
      id={`catalog-product-${product.id}`}
      className={`${styles.item}${highlighted ? ` ${styles.highlighted}` : ""}`}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href={product.href}
        className={styles.link}
        onClick={handleClick}
        aria-label={`مشاهده شناسنامه و جزئیات ${product.name}`}
      >
        <span className={styles.plate}>
          <Image src={product.image} alt={product.alt} fill sizes="150px" />
        </span>
        <strong>{product.name}</strong>
      </a>
    </motion.div>
  );
}
