"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ProductDetailData } from "@/lib/catalog/product-details";
import { useCart } from "@/lib/cart-context";
import styles from "./product-experience.module.css";

interface ProductDetailViewProps {
  product: ProductDetailData;
  onClose?: () => void;
  isModal?: boolean;
  onAddedToCart?: (product: { id: string; name: string; image?: string | null }) => void;
}

const NAV_ITEMS = [
  { id: "intro", number: "۰۱", label: "معرفی" }, { id: "nutrition", number: "۰۲", label: "ارزش غذایی" },
  { id: "cooking", number: "۰۳", label: "روش پخت" }, { id: "journey", number: "۰۴", label: "مسیر محصول" },
  { id: "reviews", number: "۰۵", label: "نظرات" },
] as const;

const JOURNEY = [
  ["۰۱", "مرتع", "چرای آزاد در هوای پاک دامنه‌های البرز؛ جایی که مسیر طعم آغاز می‌شود."],
  ["۰۲", "پرورش", "تغذیه طبیعی با آویشن، گون و پونه وحشی؛ بدون هورمون و شتاب مصنوعی."],
  ["۰۳", "انتخاب", "انتخاب دقیق برش‌ها به دست قصاب‌های باتجربه و کنترل پیوسته کیفیت."],
  ["۰۴", "آماده‌سازی", "برش و بسته‌بندی در زنجیره سرد تا تازگی و بافت طبیعی گوشت حفظ شود."],
  ["۰۵", "سفره", "رسیدن مطمئن به خانه؛ برای غذایی که قصه مبدأ آن روشن است."],
] as const;

const RELATED = [
  { id: "meat-fillet", name: "فیله", image: "/brand/v2/products/prod-08.png" },
  { id: "meat-kebab", name: "شیشلیک", image: "/brand/v2/products/prod-12.png" },
  { id: "meat-mince", name: "گوشت چرخ‌کرده", image: "/brand/v2/products/prod-22.png" },
] as const;

function scrollToSection(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }

function SectionTitle({ eyebrow, title, description, light = false }: { eyebrow: string; title: string; description?: string; light?: boolean }) {
  return <header className={`${styles.sectionTitle} ${light ? styles.light : ""}`}><span>{eyebrow}</span><h2>{title}</h2>{description ? <p>{description}</p> : null}</header>;
}

type GalleryItem = { src: string; alt: string; label: string };

function getProductGallery(product: ProductDetailData): GalleryItem[] {
  const main = { src: product.image, alt: `${product.name} مرد کوهستان`, label: "تصویر اصلی" };
  if (product.categoryId === "fresh-meat") return [
    main,
    { src: "/brand/product-gallery/lamb-shanks-mountain.png", alt: "گوشت تازه گوسفندی در فضای کوهستان", label: "برش تازه" },
    { src: "/brand/product-gallery/lamb-cast-iron-mountain.png", alt: "پیشنهاد سرو گوشت بره", label: "پیشنهاد سرو" },
    { src: "/brand/product-gallery/mountain-butcher.png", alt: "آماده سازی گوشت تازه", label: "آماده سازی" },
  ];
  return [main, { src: product.video.poster, alt: product.video.title, label: "از مسیر محصول" }, { src: "/brand/landing-table.png", alt: "پیشنهاد سرو مرد کوهستان", label: "پیشنهاد سرو" }, { src: "/brand/landing-pasture.png", alt: "طبیعت مرد کوهستان", label: "از طبیعت" }];
}

function ProductHero({ product, gallery, activeImage, onSelectImage, portion, onSelectPortion }: { product: ProductDetailData; gallery: GalleryItem[]; activeImage: GalleryItem; onSelectImage: (image: GalleryItem) => void; portion: string; onSelectPortion: (portion: string) => void }) {
  return <section className={styles.hero} aria-labelledby="product-title">
    <div className={styles.heroCopy}>
      <div className={styles.heroHeading}>
        <nav className={styles.breadcrumb} aria-label="مسیر صفحه"><Link href="/">صفحه اصلی</Link><span>/</span><Link href="/#for-home-kitchen">محصولات</Link><span>/</span><span>{product.categoryTitle}</span></nav>
        <p className={styles.eyebrow} aria-label="مرد کوهستان">
          <svg viewBox="0 0 66 38" aria-hidden="true"><path d="M2 33 19 12l8 10L39 4l25 29M17 33h47" /></svg>
        </p>
        <h1 id="product-title">{product.name}</h1>
        <span className={styles.heroAccent} aria-hidden="true" />
        <p className={styles.heroKicker}>از کوهستان تا سفره</p>
        <div className={`${styles.portions} ${styles.heroPortions}`}>{product.portionOptions.map((item) => <button key={item} className={portion === item ? styles.selected : ""} onClick={() => onSelectPortion(item)} type="button">{item}</button>)}</div>
        <button className={styles.heroCta} type="button" onClick={() => scrollToSection("purchase")}>افزودن به سبد خرید <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4L21 8H6.2M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" /></svg></button>
        <div className={`${styles.productGallery} ${styles.heroGallery}`} aria-label="آلبوم تصاویر محصول">{gallery.map((image) => <button key={image.src} type="button" className={activeImage.src === image.src ? styles.activeGalleryItem : ""} onClick={() => onSelectImage(image)} aria-label={`نمایش ${image.label}`} aria-pressed={activeImage.src === image.src}><span><Image src={image.src} alt="" fill sizes="76px" /></span><small>{image.label}</small></button>)}</div>
      </div>
      <div className={styles.heroMemoryBackdrop} aria-hidden="true" />
      <figure className={styles.heroMemory} aria-label="لحظه‌ای از یک سفره خانوادگی">
        <span className={styles.heroMemoryPin} aria-hidden="true" />
        <span className={styles.heroMemoryPhoto}><Image src="/brand/product-family-meal-v1.png" alt="پدر و پسر در حال صرف غذا کنار سفره خانوادگی" fill sizes="(max-width: 760px) 42vw, 175px" /></span>
      </figure>
      <div className={styles.heroDetails}>
        <p className={styles.heroLead}>{product.headline}</p><p className={styles.heroBody}>{product.story}</p>
        <p className={styles.editorialNote} aria-hidden="true">طبیعت<br />مزه بهتر زندگی است...</p>
      </div>
    </div>
    <figure className={styles.heroVisual}>
      <div className={styles.heroAtmosphere} aria-hidden="true" />
      <p className={styles.visualSlogan} aria-hidden="true">اصالتِ کوهستان<br />در هر برش</p>
      <div className={styles.platformLayer} aria-hidden="true"><Image src="/brand/product-steak-platform-cutout-v5.png" alt="" fill sizes="(max-width: 760px) 91vw, 780px" /></div>
      <div className={`${styles.productStage} ${activeImage.src === product.image ? "" : styles.galleryStage}`}><Image key={activeImage.src} src={activeImage.src} alt={activeImage.alt} fill priority sizes="(max-width: 760px) 74vw, 480px" /></div>
      <figcaption><span>مستقیم از کوهستان</span><strong>تا سفره شما</strong></figcaption>
    </figure>
  </section>;
}

function ProductScrollNav() {
  const [active, setActive] = useState("intro");
  useEffect(() => {
    const sections = NAV_ITEMS.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (visible) setActive(visible.target.id); }, { rootMargin: "-22% 0px -65%", threshold: [0, .15, .4] });
    sections.forEach((section) => observer.observe(section)); return () => observer.disconnect();
  }, []);
  return <nav className={styles.scrollNav} aria-label="بخش‌های داستان محصول"><div>{NAV_ITEMS.map((item) => <button key={item.id} className={active === item.id ? styles.active : ""} onClick={() => scrollToSection(item.id)} type="button" aria-current={active === item.id ? "location" : undefined}><small>{item.number}</small>{item.label}</button>)}</div></nav>;
}

function ProductIntro({ product }: { product: ProductDetailData }) {
  return <section id="intro" className={`${styles.section} ${styles.intro}`}><div><SectionTitle eyebrow="طعمِ مبدأ" title="طعم واقعی طبیعت کوهستان" /><p className={styles.editorialBody}>{product.story}</p></div><blockquote><span>از دامنه‌های کوهستان</span><strong>تا سفره خانواده</strong><cite>— مسیر سبز مرد کوهستان</cite></blockquote></section>;
}

function ProductHighlights() {
  return <section className={styles.highlights} aria-labelledby="highlights-title"><div className={styles.highlightsInner}><div className={styles.highlightsCopy}><SectionTitle light eyebrow="اصالت در هر برش" title="چرا این محصول متفاوت است؟" /><ol>
    <li><span>۰۱</span><div><strong>دام آزاد</strong><p>پرورش در مراتع باز و تغذیه طبیعی</p></div></li><li><span>۰۲</span><div><strong>بدون هورمون</strong><p>رشد طبیعی، بدون آنتی‌بیوتیک غیرضروری</p></div></li><li><span>۰۳</span><div><strong>بافت لطیف</strong><p>برش دقیق با عطر و طعم اصیل مرتع</p></div></li>
  </ol></div><figure className={styles.highlightImage}><Image src="/brand/landing-pasture.png" alt="مراتع سرسبز محل پرورش دام مرد کوهستان" fill sizes="(max-width: 900px) 100vw, 48vw" /></figure></div></section>;
}

function ProductNutrition({ product }: { product: ProductDetailData }) {
  const values = [["۱۶۵", "کیلوکالری", product.nutrition.calories], ["۲۲g", "پروتئین", product.nutrition.protein], ["۶g", "چربی طبیعی", product.nutrition.fat], ["۳.۲mg", "آهن", product.nutrition.ironOrOmega]];
  return <section id="nutrition" className={`${styles.section} ${styles.nutrition}`}><SectionTitle eyebrow="تعادل طبیعی" title="ارزش غذایی" description="در هر ۱۰۰ گرم از محصول" /><div className={styles.statGrid}>{values.map(([value, label, detail]) => <div key={label} title={detail}><strong dir="ltr">{value}</strong><span>{label}</span></div>)}</div></section>;
}

function ProductCooking({ product }: { product: ProductDetailData }) {
  return <section id="cooking" className={styles.cooking}><figure><Image src="/brand/landing-table.png" alt={`پیشنهاد سرو و پخت ${product.name}`} fill sizes="(max-width: 900px) 100vw, 52vw" /></figure><div className={styles.cookingCopy}><SectionTitle eyebrow="پیشنهاد آشپز" title="حرارت کوتاه، طعم ماندگار" /><h3>{product.chefTip.cookingStyle}</h3><p>{product.chefTip.description}</p><dl className={styles.cookingMeta}><div><dt>۰۳–۰۵ دقیقه</dt><dd>زمان استراحت</dd></div><div><dt>۲۲۰°</dt><dd>دمای پیشنهادی</dd></div></dl><p className={styles.spices}><span>همراه پیشنهادی</span>{product.chefTip.spices}</p></div></section>;
}

function ProductJourney() {
  return <section id="journey" className={styles.journey}><div className={styles.journeyInner}><div className={styles.journeyVisual}><figure><Image src="/brand/v2/book/mag-path.png" alt="مسیر سبز مرد کوهستان از مرتع تا سفره" fill sizes="(max-width: 800px) 100vw, 42vw" /></figure><p>این راه سبز است</p></div><div className={styles.journeyCopy}><SectionTitle light eyebrow="ردِ یک انتخاب روشن" title="از مرتع تا سفره" description="پنج قدم پیوسته برای محصولی که می‌دانید از کجا آمده است." /><ol>{JOURNEY.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></div></section>;
}

function ProductSpecifications({ product }: { product: ProductDetailData }) {
  const fields = [["منشأ", product.origin.pastureName], ["منطقه", product.origin.region], ["ارتفاع", product.origin.altitude], ["نوع تغذیه", product.origin.diet], ["زنجیره سرد", product.origin.coldChainTemp], ["بسته‌بندی", product.origin.ecoPack], ["رده کیفی", "A+"]];
  return <section id="specifications" className={`${styles.section} ${styles.specifications}`}><SectionTitle eyebrow="شفاف و قابل رهگیری" title="شناسنامه محصول" description="هر آنچه برای یک انتخاب مطمئن باید بدانید." /><dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}

function ProductPurchase({
  product,
  portion,
  onAddedToCart,
}: {
  product: ProductDetailData;
  portion: string;
  onAddedToCart?: ProductDetailViewProps["onAddedToCart"];
}) {
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();
  const price = useMemo(() => portion.includes("۵۰۰") ? product.price / 2 : portion.includes("۲") ? product.price * 2 : product.price, [portion, product.price]);
  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const result = await addToCart({
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        portion,
        cut_type: product.cutOptions[0] || "",
        unit_price_toman: Math.round(price),
        quantity: 1,
      });
      if (result.success) {
        setAdded(true);
        onAddedToCart?.({ id: product.id, name: product.name, image: product.image });
        window.setTimeout(() => setAdded(false), 3500);
      }
    } finally {
      setIsAdding(false);
    }
  };
  return <section id="purchase" className={`${styles.section} ${styles.purchase}`} aria-labelledby="purchase-title"><div><span>انتخاب برای سفره</span><h2 id="purchase-title">این برش را به خانه ببرید</h2><p>تازه، بسته‌بندی‌شده و با زنجیره سرد تا درِ خانه.</p></div><div className={styles.purchaseAction}><p><strong>{Math.round(price).toLocaleString("fa-IR")}</strong> تومان</p><button className={styles.addButton} type="button" disabled={isAdding} onClick={handleAddToCart}>{isAdding ? "در حال افزودن…" : added ? "به سبد شما افزوده شد" : "افزودن به سبد تازه"}</button></div></section>;
}

function RelatedProducts() {
  return <section className={`${styles.section} ${styles.related}`}><SectionTitle eyebrow="ادامه مسیر سبز" title="برش‌های دیگر برای کشف" /><div className={styles.relatedGrid}>{RELATED.map((item) => <Link href={`/products/${item.id}`} key={item.id}><figure><Image src={item.image} alt={item.name} fill sizes="(max-width: 700px) 90vw, 30vw" /></figure><div><span>گوشت و مرتع</span><h3>{item.name}</h3><b aria-hidden="true">←</b></div></Link>)}</div></section>;
}

function ProductReviews() {
  return <section id="reviews" className={`${styles.section} ${styles.reviews}`}><SectionTitle eyebrow="تجربه خریداران" title="نظرات مشتریان" /><p>به‌زودی تجربهٔ خریداران مرد کوهستان را اینجا می‌خوانید.</p></section>;
}

export function ProductExperience({ product, onClose, isModal = false, onAddedToCart }: ProductDetailViewProps) {
  const gallery = useMemo(() => getProductGallery(product), [product]);
  const [activeImage, setActiveImage] = useState<GalleryItem>(gallery[0]);
  const [portion, setPortion] = useState(product.portionOptions[0] || "۵۰۰ گرم");
  return <article className={`${styles.experience} ${isModal ? styles.modal : ""}`} dir="rtl">{isModal && onClose ? <button type="button" className={styles.close} onClick={onClose} aria-label="بستن جزئیات محصول">×</button> : null}<ProductHero product={product} gallery={gallery} activeImage={activeImage} onSelectImage={setActiveImage} portion={portion} onSelectPortion={setPortion} /><ProductScrollNav /><ProductIntro product={product} /><ProductHighlights /><ProductNutrition product={product} /><ProductCooking product={product} /><ProductJourney /><ProductSpecifications product={product} /><ProductPurchase product={product} portion={portion} onAddedToCart={onAddedToCart} /><RelatedProducts /><ProductReviews /></article>;
}

export function ProductDetailView(props: ProductDetailViewProps) { return <ProductExperience {...props} />; }
