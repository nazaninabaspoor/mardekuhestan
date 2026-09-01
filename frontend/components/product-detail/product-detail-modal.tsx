"use client";

import React, { useEffect } from "react";
import { ProductDetailData } from "@/lib/catalog/product-details";
import { ProductDetailView } from "./product-detail-view";

interface ProductDetailModalProps {
  product: ProductDetailData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div
      className="pdetail-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="pdetail-modal-card">
        <ProductDetailView product={product} onClose={onClose} isModal={true} />
      </div>
    </div>
  );
}
