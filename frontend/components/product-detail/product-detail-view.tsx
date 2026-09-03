"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProductDetailData } from "@/lib/catalog/product-details";

interface ProductDetailViewProps { product: ProductDetailData; onClose?: () => void; isModal?: boolean; }

const NAV_ITEMS = [
  { id: "introduction", label: "معرفی" },
  { id: "nutrition", label: "ارزش غذایی" },
  { id: "cooking-guide", label: "روش پخت" },
  { id: "product-story", label: "از مرتع تا سفره" },
  { id: "origin", label: "شناسنامه" },
] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionHeading({ id, eyebrow, title, subtitle }: { id?: string; eyebrow?: string; title: string; subtitle?: string }) {
  const resolvedId = id ?? ({
    "طعم واقعی طبیعت کوهستان": "intro-title",
    "ارزش غذایی": "nutrition-title",
    "نحوه طبخ پیشنهادی": "cooking-title",
    "از مرتع تا سفره": "story-video-title",
    "شناسنامه محصول": "origin-title",
    "سفارش محصول": "purchase-title",
  } as Record<string, string>)[title];
  return <header className="pdetail-section-heading">
    {eyebrow ? <span>{eyebrow}</span> : null}<h2 id={resolvedId}>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}
  </header>;
}

function ProductHero({ product }: { product: ProductDetailData }) {
  const facts = [
    { value: "۱۰۰٪", label: "طبیعی" },
    { value: product.nutrition.protein, label: "پروتئین" },
    { value: product.nutrition.calories, label: "انرژی" },
    { value: product.origin.diet, label: "نوع تغذیه" },
  ].filter((item) => item.value);
  return <section className="pdetail-hero" aria-labelledby="product-title">
    <div className="pdetail-hero-visual"><Image src={product.image} alt={product.name} fill priority className="pdetail-hero-image" sizes="(max-width: 900px) 100vw, 55vw" /></div>
    <div className="pdetail-hero-content">
      <nav className="pdetail-breadcrumb" aria-label="مسیر صفحه"><Link href="/">صفحه اصلی</Link><span aria-hidden="true">/</span><Link href="/#for-home-kitchen">محصولات</Link><span aria-hidden="true">/</span><span>{product.categoryTitle}</span></nav>
      <span className="pdetail-category-tag">{product.categoryTitle}</span>
      <h1 id="product-title" className="pdetail-main-name">{product.name}</h1>
      <p className="pdetail-headline-lead">{product.headline}</p>
      <p className="pdetail-hero-summary">{product.story}</p>
      <div className="pdetail-quick-facts" aria-label="ویژگی‌های مهم محصول">{facts.map((fact) => <div className="pdetail-quick-fact" key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}</div>
      <div className="pdetail-hero-actions"><button type="button" onClick={() => scrollToSection("cooking-guide")} className="pdetail-primary-action">مشاهده روش پخت</button><button type="button" onClick={() => scrollToSection("introduction")} className="pdetail-text-action">داستان این محصول</button></div>
    </div>
  </section>;
}

function ProductStickyNav() {
  const [activeId, setActiveId] = useState<string>(NAV_ITEMS[0].id);
  useEffect(() => {
    const sections = NAV_ITEMS.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveId(visible.target.id);
    }, { rootMargin: "-28% 0px -60%", threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  return <nav className="pdetail-sticky-nav" aria-label="بخش‌های صفحه محصول"><div className="pdetail-sticky-nav-inner">{NAV_ITEMS.map((item) => <button key={item.id} type="button" className={activeId === item.id ? "is-active" : ""} aria-current={activeId === item.id ? "location" : undefined} onClick={() => scrollToSection(item.id)}>{item.label}</button>)}</div></nav>;
}

function ProductIntroduction({ product }: { product: ProductDetailData }) {
  return <section id="introduction" className="pdetail-section pdetail-introduction" aria-labelledby="intro-title"><div><SectionHeading eyebrow="معرفی محصول" title="طعم واقعی طبیعت کوهستان" /><p className="pdetail-editorial-copy">{product.story}</p></div><blockquote><span aria-hidden="true">“</span>از دامنه‌های کوهستان تا سفره خانواده</blockquote></section>;
}

function ProductNutrition({ product }: { product: ProductDetailData }) {
  const nutrition = [[product.nutrition.protein, "پروتئین خالص"], [product.nutrition.calories, "انرژی"], [product.nutrition.fat, "چربی طبیعی"], [product.nutrition.ironOrOmega, "مواد معدنی"]].filter(([value]) => value);
  if (!nutrition.length) return null;
  return <section id="nutrition" className="pdetail-section pdetail-nutrition" aria-labelledby="nutrition-title"><SectionHeading title="ارزش غذایی" subtitle="در هر ۱۰۰ گرم" /><div className="pdetail-nutrition-grid">{nutrition.map(([value, label]) => <div className="pdetail-nutri-item" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>;
}

function ProductCookingGuide({ product }: { product: ProductDetailData }) {
  if (!product.chefTip) return null;
  return <section id="cooking-guide" className="pdetail-section pdetail-cooking" aria-labelledby="cooking-title"><div className="pdetail-cooking-copy"><SectionHeading eyebrow="پیشنهاد آشپز" title="نحوه طبخ پیشنهادی" /><h3>{product.chefTip.cookingStyle}</h3><p>{product.chefTip.description}</p><div className="pdetail-cooking-meta"><div><span>زمان استراحت</span><strong>{product.chefTip.restTime}</strong></div><div><span>روش پیشنهادی</span><strong>{product.chefTip.cookingStyle}</strong></div></div><p className="pdetail-spices"><span>ادویه‌های همراه</span>{product.chefTip.spices}</p></div><div className="pdetail-cooking-image"><Image src={product.image} alt={`پیشنهاد پخت ${product.name}`} fill sizes="(max-width: 900px) 100vw, 42vw" /></div></section>;
}

function ProductStoryVideo({ product }: { product: ProductDetailData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  if (!product.video?.poster && !product.video?.videoUrl) return null;
  return <section id="product-story" className="pdetail-video-section" aria-labelledby="story-video-title"><div className="pdetail-video-heading"><SectionHeading eyebrow="داستان اصالت" title="از مرتع تا سفره" subtitle={product.video.title} /></div><div className="pdetail-video-frame">{isPlaying && product.video.videoUrl ? <video src={product.video.videoUrl} controls autoPlay className="pdetail-html-video" /> : <><Image src={product.video.poster || product.image} alt={product.video.title} fill className="pdetail-video-poster" sizes="(max-width: 1100px) 100vw, 1100px" /><div className="pdetail-video-overlay" /><button type="button" className="pdetail-play-trigger" onClick={() => product.video.videoUrl && setIsPlaying(true)} aria-label={`پخش ویدئوی ${product.video.title}`} disabled={!product.video.videoUrl}><span className="pdetail-play-icon" aria-hidden="true">▶</span><span>{product.video.videoUrl ? "تماشای روایت محصول" : product.video.duration}</span></button></>}</div></section>;
}

function ProductOrigin({ product }: { product: ProductDetailData }) {
  const fields = [["محل پرورش و چرا", product.origin.pastureName], ["منطقه", product.origin.region], ["ارتفاع از سطح دریا", product.origin.altitude], ["نوع تغذیه", product.origin.diet], ["زنجیره سرد", product.origin.coldChainTemp], ["بسته‌بندی", product.origin.ecoPack]].filter(([, value]) => value);
  return <section id="origin" className="pdetail-section pdetail-origin" aria-labelledby="origin-title"><SectionHeading eyebrow="قابل رهگیری" title="شناسنامه محصول" subtitle="مسیر روشن محصول، از مبدأ تا خانه" /><dl className="pdetail-origin-grid">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}

function ProductPurchase({ product }: { product: ProductDetailData }) {
  const [selectedPortion, setSelectedPortion] = useState(product.portionOptions[0] || "۱ کیلوگرم");
  const [selectedCut, setSelectedCut] = useState(product.cutOptions[0] || "برش استاندارد");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const totalPrice = useMemo(() => { let multiplier = 1; if (selectedPortion.includes("۵۰۰")) multiplier = 0.5; if (selectedPortion.includes("۲")) multiplier = 2; if (selectedPortion.includes("۱.۵")) multiplier = 1.5; if (selectedPortion.includes("۵")) multiplier = 4.5; return Math.round(product.price * multiplier * quantity); }, [product.price, quantity, selectedPortion]);
  const addToCart = () => { setAddedToCart(true); window.setTimeout(() => setAddedToCart(false), 3000); };
  return <section className="pdetail-section pdetail-purchase" aria-labelledby="purchase-title"><div className="pdetail-purchase-heading"><SectionHeading eyebrow="انتخاب برای سفره" title="سفارش محصول" /><div className="pdetail-total-price"><strong>{totalPrice.toLocaleString("fa-IR")}</strong><span>تومان</span></div></div><div className="pdetail-order-options"><fieldset><legend>وزن و حجم سفارش</legend><div>{product.portionOptions.map((portion) => <button key={portion} type="button" className={selectedPortion === portion ? "is-selected" : ""} onClick={() => setSelectedPortion(portion)}>{portion}</button>)}</div></fieldset><fieldset><legend>نوع آماده‌سازی و برش</legend><div>{product.cutOptions.map((cut) => <button key={cut} type="button" className={selectedCut === cut ? "is-selected" : ""} onClick={() => setSelectedCut(cut)}>{cut}</button>)}</div></fieldset></div><div className="pdetail-purchase-actions"><div className="pdetail-qty-control" aria-label="تعداد محصول"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="کاهش تعداد">−</button><span aria-live="polite">{quantity.toLocaleString("fa-IR")}</span><button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="افزایش تعداد">+</button></div><button type="button" className={`pdetail-submit-btn ${addedToCart ? "is-added" : ""}`} onClick={addToCart}>{addedToCart ? "به سفره شما افزوده شد" : "افزودن به سبد تازه کوهستان"}</button><Link href="/profile?tab=ai-nutrition" className="pdetail-ai-btn">مشاوره رژیم و پخت با راهیار</Link></div></section>;
}

export function ProductDetailView({ product, onClose, isModal = false }: ProductDetailViewProps) {
  return <article className={`pdetail-container ${isModal ? "is-in-modal" : ""}`}>{isModal && onClose ? <button type="button" className="pdetail-close-btn" onClick={onClose} aria-label="بستن جزئیات محصول">×</button> : null}<ProductHero product={product} /><ProductStickyNav /><div className="pdetail-content-shell"><ProductIntroduction product={product} /><ProductNutrition product={product} /><ProductCookingGuide product={product} /><ProductStoryVideo product={product} /><ProductOrigin product={product} /><ProductPurchase product={product} /></div></article>;
}
