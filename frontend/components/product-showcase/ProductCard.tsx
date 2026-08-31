"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
};

export function ProductCard({ product, highlighted = false }: ProductCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      id={`catalog-product-${product.id}`}
      className={`${styles.item}${highlighted ? ` ${styles.highlighted}` : ""}`}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={product.href} className={styles.link}>
        <span className={styles.plate}>
          <Image src={product.image} alt={product.alt} fill sizes="150px" />
        </span>
        <strong>{product.name}</strong>
      </Link>
    </motion.div>
  );
}
