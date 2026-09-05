"use client";

import React, { Suspense, useEffect, useLayoutEffect, useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import {
  authErrorMessage,
  changePassword,
  createAddress,
  CustomerAddress,
  getUserAddresses,
  updateAddress,
} from "@/lib/api/auth";
import {
  fetchUserOrders,
  checkoutUserCart,
  type ApiOrder,
} from "@/lib/api/orders";
import { getAccessToken, setAccessToken } from "@/lib/api/access-token";

type ActiveTab = "personal" | "ai-nutrition" | "wallet" | "subscription" | "orders";

interface CoverflowItem {
  id: ActiveTab;
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon: string;
  image: string;
  scenePosition?: string;
  actionText: string;
  statsText: string;
  gradient: string;
}

const COVERFLOW_ITEMS: CoverflowItem[] = [
  {
    id: "personal",
    title: "اطلاعات فردی و امنیت",
    subtitle: "مدیریت حساب کاربری، رمز عبور و امنیت ورود",
    badge: "امنیت و حساب",
    badgeIcon: "🛡️",
    image: "/brand/profile/print-personal-security.png",
    scenePosition: "center",
    actionText: "مشاهده و ویرایش مشخصات",
    statsText: "احراز شده و فعال",
    gradient: "from-[#005B48]/90 via-[#003B2E]/90 to-[#00221A]/95",
  },
  {
    id: "ai-nutrition",
    title: "دستیار هوش مصنوعی تغذیه",
    subtitle: "مشاوره تخصصی رژیم ارگانیک، ارزش غذایی و طبخ اصیل",
    badge: "ویژه همسفران",
    badgeIcon: "✨",
    image: "/brand/profile/print-ai-mind-morning.png",
    scenePosition: "center",
    actionText: "گفتگو با دستیار هوشمند",
    statsText: "آنلاین و پاسخگو",
    gradient: "from-[#005B48]/90 via-[#004234]/90 to-[#001D16]/95",
  },
  {
    id: "wallet",
    title: "کیف پول و باشگاه سبز",
    subtitle: "مدیریت اعتبار نقدی، کوپن‌های تخفیف و امتیازات کوهستان",
    badge: "باشگاه وفاداری",
    badgeIcon: "🌱",
    image: "/brand/profile/print-wallet-club.png",
    scenePosition: "center",
    actionText: "شارژ و مدیریت اعتبار",
    statsText: "۵۰,۰۰۰ تومان اعتبار",
    gradient: "from-[#005B48]/90 via-[#403010]/90 to-[#221A08]/95",
  },
  {
    id: "subscription",
    title: "اشتراک هفتگی سبد تازه",
    subtitle: "ارسال دوره‌ای محصولات تازه ارگانیک با زنجیره سرد",
    badge: "سرویس ویژه",
    badgeIcon: "📦",
    image: "/brand/profile/print-subscription-basket.png",
    scenePosition: "center",
    actionText: "تنظیم و انتخاب سبد",
    statsText: "تخفیف دائمی ۱۰٪",
    gradient: "from-[#005B48]/90 via-[#003D30]/90 to-[#001F18]/95",
  },
  {
    id: "orders",
    title: "سفارش‌ها و شناسنامه مرتع",
    subtitle: "پیگیری لحظه‌ای و اصالت‌سنجی مبدا تولید مزرعه و مرتع",
    badge: "ردیابی ارگانیک",
    badgeIcon: "🏔️",
    image: "/brand/profile/print-orders-passport.png",
    scenePosition: "center",
    actionText: "مشاهده سوابق و شناسنامه",
    statsText: "۱ سفارش تحویل شده",
    gradient: "from-[#005B48]/90 via-[#1A3830]/90 to-[#0B1E1A]/95",
  },
];

const AI_PROMPTS = [
  "بهترین روش پخت گوشت راسته گوسفندی مرتعی برای حفظ لطافت و پروتئین چیست؟",
  "یک برنامه غذایی پروتئینی و سالم برای ۳ روز با محصولات مرد کوهستان به من پیشنهاد بده.",
  "تفاوت طعم و ارزش غذایی ماهی قزل‌آلای آب سرد کوهستان با ماهی‌های پرورشی عادی چیست؟",
  "روغن حیوانی و کره سنتی کوهپایه در رژیم کتوژنیک چه تاثیری دارد؟",
];

const INITIAL_AI_MESSAGES = [
  {
    sender: "assistant",
    text: "درود. ما اینجاییم؛ مرد کوهستان و دستیار تغذیه مرتع. از خواص گوشت مرتع تا برنامه روزانه و طبخ اصیل، بگویید چه کمکی از دست‌مان برمی‌آید.",
    time: "همین حالا",
  },
];

function AiMessageBody({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p key={i}>{line || "\u00A0"}</p>
      ))}
    </>
  );
}

function folioLockWord(password: string) {
  if (!password) return "";
  if (password.length < 10) return "رمز ضعیف (حداقل ۱۰ نویسه)";
  if (password.length < 14) return "قفل محکم و مطمئن";
  return "فولاد ضدسرقت";
}

function toMrz(text: string, length = 44) {
  const cleaned = text.replace(/@/g, "<").replace(/[^a-zA-Z0-9]+/g, "<").toUpperCase();
  return `${cleaned}${"<".repeat(length)}`.slice(0, length);
}

function passportNo(email: string) {
  const core = email.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7).padEnd(7, "X");
  return `MK${core}`;
}

function MailLaneMark() {
  return (
    <svg className="mk-mail-lane" viewBox="0 0 980 52" role="img" aria-hidden="true">
      <g fill="none" stroke="#D4A359" strokeWidth="1.15" strokeLinejoin="miter">
        <polygon points="90,38 170,8 250,38" opacity="0.35" />
        <polygon points="390,38 490,4 590,38" opacity="0.28" />
        <polygon points="730,38 820,10 910,38" opacity="0.32" />
        <polygon points="40,38 52,18 64,38" />
        <polygon points="300,38 310,22 320,38" />
        <polygon points="660,38 672,16 684,38" />
        <polygon points="940,38 952,20 964,38" />
        <rect x="118" y="24" width="52" height="16" strokeDasharray="3 2.5" />
        <rect x="430" y="14" width="36" height="26" />
        <path d="M436 20 H460 M436 26 H460 M436 32 H460" />
        <polygon points="786,14 812,2 838,14" />
        <rect x="792" y="14" width="40" height="26" />
        <path d="M804 22 H812 V30 H808" />
        <path d="M8 44 H972" strokeDasharray="5 4" opacity="0.7" />
      </g>
    </svg>
  );
}

function PacketGlyph({ kind }: { kind: "home" | "office" | "lot" }) {
  if (kind === "office") {
    return (
      <svg className="mk-packet-glyph" viewBox="0 0 40 36" aria-hidden="true">
        <g fill="none" stroke="#D4A359" strokeWidth="1.4">
          <rect x="8" y="6" width="24" height="26" />
          <rect x="12" y="11" width="5" height="5" />
          <rect x="18" y="11" width="5" height="5" />
          <rect x="24" y="11" width="5" height="5" />
          <rect x="12" y="18" width="5" height="5" />
          <rect x="18" y="18" width="5" height="5" />
          <rect x="24" y="18" width="5" height="5" />
        </g>
      </svg>
    );
  }
  if (kind === "lot") {
    return (
      <svg className="mk-packet-glyph" viewBox="0 0 40 36" aria-hidden="true">
        <g fill="none" stroke="#D4A359" strokeWidth="1.4" strokeDasharray="2.4 2">
          <rect x="7" y="8" width="26" height="22" />
        </g>
        <path d="M20 14 V24 M15 19 H25" stroke="#D4A359" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className="mk-packet-glyph" viewBox="0 0 40 36" aria-hidden="true">
      <g fill="none" stroke="#D4A359" strokeWidth="1.4">
        <polygon points="20,4 6,16 34,16" />
        <rect x="10" y="16" width="20" height="16" />
        <path d="M17 32 V22 H23 V32" />
      </g>
    </svg>
  );
}

function LedgerSecretField({
  id,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mk-safe-secret">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="mk-safe-input"
        dir="ltr"
      />
      <button
        type="button"
        className={`mk-safe-peek${visible ? " is-active" : ""}`}
        onClick={() => setVisible((open) => !open)}
        title={visible ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
        aria-label={visible ? "پنهان کردن رمز" : "نمایش رمز"}
      >
        {visible ? (
          <>
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <span>مخفی</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>نمایش</span>
          </>
        )}
      </button>
    </div>
  );
}

function InteractiveCard({
  item,
  index,
  selectedIndex,
  onSelect,
}: {
  item: CoverflowItem;
  index: number;
  selectedIndex: number;
  onSelect: () => void;
}) {
  const total = COVERFLOW_ITEMS.length;
  let offset = index - selectedIndex;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;

  const isActive = offset === 0;
  const isAdjacent = Math.abs(offset) === 1;
  const isFar = Math.abs(offset) >= 2;

  // Standing frames on one table — all solid, none faded
  const translateX = offset * 152;
  const translateY = isActive ? 0 : isAdjacent ? -4 : -8;
  const translateZ = isActive ? 20 : isAdjacent ? -18 : -42;
  const rotateY = offset * -8;
  const rotateX = -12;
  const scale = isActive ? 1 : isAdjacent ? 0.92 : 0.84;
  const zIndex = 30 - Math.abs(offset) * 10;

  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const tiltRotateX = useTransform(cardY, [-150, 150], [1.2, -1.2]);
  const tiltRotateY = useTransform(cardX, [-150, 150], [-1.6, 1.6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    cardX.set(x);
    cardY.set(y);
  };

  const handleMouseLeave = () => {
    cardX.set(0);
    cardY.set(0);
  };

  return (
    <motion.div
      className={`coverflow-slot ${isActive ? "is-active" : ""} ${isAdjacent ? "is-adjacent" : ""} ${isFar ? "is-far" : ""}`}
      style={{ zIndex }}
      animate={{
        x: translateX,
        y: translateY,
        z: translateZ,
        rotateY: rotateY,
        rotateX: rotateX,
        scale: scale,
      }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 28,
        mass: 0.95,
      }}
      whileHover={
        isActive
          ? { scale: 1.015, transition: { duration: 0.3 } }
          : { scale: scale * 1.02, transition: { duration: 0.3 } }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      role="button"
      aria-label={item.title}
    >
      <span className="coverflow-slot-shadow is-pool" aria-hidden="true" />
      <span className="coverflow-slot-shadow is-contact" aria-hidden="true" />
      <span className="frame-easel" aria-hidden="true">
        <span className="frame-easel-leg is-left" />
        <span className="frame-easel-leg is-right" />
        <span className="frame-easel-leg is-back" />
        <span className="frame-easel-bar" />
      </span>
      <motion.div
        className={`coverflow-card ${isActive ? "is-active" : ""}`}
        style={isActive ? { rotateX: tiltRotateX, rotateY: tiltRotateY } : undefined}
      >
        <div className="frame-wood">
          <div className="frame-mat">
            <div className="coverflow-card-bg-wrap">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 768px) 280px, 340px"
                quality={92}
                className="coverflow-card-img"
                style={{ objectPosition: item.scenePosition ?? "center" }}
                priority={isActive || isAdjacent}
              />
            </div>
          </div>
          <div className="frame-plate">
            <span className="frame-plate-kicker">{item.badge}</span>
            <strong className="frame-plate-title">{item.title}</strong>
            <span className="frame-plate-action">{item.actionText}</span>
          </div>
          <span className="frame-foot" aria-hidden="true" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProfileSceneBackdrop({ isWorkspaceOpen = false }: { isWorkspaceOpen?: boolean }) {
  return (
    <div className={`profile-scene-wallpaper ${isWorkspaceOpen ? "is-blurred" : ""}`} aria-hidden="true">
      <motion.div
        className="profile-scene-wallpaper-inner"
        animate={{
          filter: isWorkspaceOpen
            ? "blur(40px) brightness(0.32) saturate(1.2)"
            : "blur(0px) brightness(1) saturate(1)",
          scale: isWorkspaceOpen ? 1.08 : 1,
        }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Image
          src="/brand/profile/profile-kitchen-dawn.png"
          alt=""
          fill
          sizes="100vw"
          quality={92}
          priority
          className="profile-scene-wallpaper-img"
        />
      </motion.div>
      <motion.div
        className="profile-scene-glass-overlay"
        animate={{
          opacity: isWorkspaceOpen ? 1 : 0,
        }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="profile-scene-vignette" />
      <span className="profile-scene-grain" />
    </div>
  );
}

const CURRENT_PENDING_INVOICE = {
  invoiceNumber: "INV-1405-9920",
  date: "جمعه ۱۴ شهریور ۱۴۰۵",
  status: "در انتظار پرداخت آنلاین",
  dueDate: "۱۴ شهریور ۱۴۰۵ - ۲۳:۵۹",
  items: [
    {
      row: 1,
      name: "راسته گوسفند پرواری مرتع ییلاقی کلاردشت (۱.۵ کیلو)",
      code: "MK-PR-102",
      weight: "۱,۵۰۰ گرم",
      unitPrice: "۵۴۰,۰۰۰ تومان",
      total: "۸۱۰,۰۰۰ تومان",
    },
    {
      row: 2,
      name: "کره سنتی ییلاقی دوغی خالص کوهپایه (۵۰۰ گرم)",
      code: "MK-DY-408",
      weight: "۵۰۰ گرم",
      unitPrice: "۲۴۰,۰۰۰ تومان",
      total: "۲۴۰,۰۰۰ تومان",
    },
    {
      row: 3,
      name: "عسل آویشن و گون وحشی سبلان (۱ کیلوگرم)",
      code: "MK-HN-201",
      weight: "۱,۰۰۰ گرم",
      unitPrice: "۴۵۰,۰۰۰ تومان",
      total: "۴۵۰,۰۰۰ تومان",
    },
  ],
  subtotal: "۱,۵۰۰,۰۰۰ تومان",
  discountQuota: "۱۵۰,۰۰۰ تومان (تخفیف سهمیه سبز)",
  shippingColdChain: "رایگان (سفیر اختصاصی زنجیره سرد)",
  payableAmount: "۱,۳۵۰,۰۰۰ تومان",
};

export function handleDownloadOrderPdf(type: "book" | "invoice", data: any, buyerInfo: any) {
  if (typeof window === "undefined") return;
  const printWindow = window.open("", "_blank", "width=850,height=1000");
  if (!printWindow) {
    alert("لطفاً اجازه باز شدن پنجره پاپ‌آپ (Pop-up) را در مرورگر خود صادر فرمایید.");
    return;
  }

  const isBook = type === "book";
  const contentHtml = isBook
    ? `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>شناسنامه اصالت مرتع #${data.id} - مرد کوهستان</title>
        <style>
          body { font-family: Tahoma, 'Segoe UI', sans-serif; direction: rtl; padding: 40px; background: #faf8f2; color: #1d1d1b; }
          .cert-container { border: 3px double #005b48; padding: 30px; border-radius: 12px; background: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .cert-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #005b48; padding-bottom: 15px; margin-bottom: 20px; }
          .cert-title h1 { margin: 0; color: #005b48; font-size: 22px; }
          .cert-title p { margin: 5px 0 0; color: #666; font-size: 13px; }
          .cert-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f4f0e8; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
          .cert-grid div strong { color: #005b48; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th { background: #005b48; color: #ffffff; padding: 10px; text-align: right; }
          td { border-bottom: 1px solid #ddd; padding: 10px; }
          .cert-footer { display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #005b48; padding-top: 15px; margin-top: 20px; }
          .stamp-box { border: 2px dashed #005b48; padding: 10px 20px; border-radius: 8px; color: #005b48; font-weight: bold; text-align: center; }
          @media print { body { padding: 0; background: #fff; } .cert-container { box-shadow: none; border-color: #000; } }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="cert-header">
            <div class="cert-title">
              <h1>سند رسمی اصالت مرتع و زنجیره پروتئین</h1>
              <p>باشگاه همسفران و پایش کیفیت مرد کوهستان · کد رهگیری: #${data.id}</p>
            </div>
            <div style="text-align: left;">
              <strong>تاریخ ثبت: ${data.date}</strong><br />
              <small>وضعیت: ${data.status}</small>
            </div>
          </div>
          <div class="cert-grid">
            <div><strong>چراگاه خاستگاه:</strong> ${data.pastureName}</div>
            <div><strong>ارتفاع چراگاه:</strong> ${data.altitude}</div>
            <div><strong>تغذیه دام:</strong> ${data.grazing}</div>
            <div><strong>تأییدیه بهداشت دامپزشکی:</strong> ${data.vetCode}</div>
          </div>
          <table>
            <thead>
              <tr><th>ردیف</th><th>شرح اقلام پروتئینی</th><th>فرآوری و برش</th><th>مبلغ</th></tr>
            </thead>
            <tbody>
              ${data.items.map((it: any, i: number) => `<tr><td>${i + 1}</td><td>${it.name}</td><td>${it.cut}</td><td>${it.price}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="cert-footer">
            <div>
              <strong>مبلغ نهایی پرداخت‌شده: ${data.finalPrice}</strong><br />
              <small>پایش دما: ${data.tempLog}</small>
            </div>
            <div class="stamp-box">
              مُهر تایید دیجیتال اصالت مرتع<br />مرد کوهستان (گله آزاد)
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `
    : `
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>پیش‌فاکتور سفارش #${data.invoiceNumber} - مرد کوهستان</title>
        <style>
          body { font-family: Tahoma, 'Segoe UI', sans-serif; direction: rtl; padding: 40px; background: #ffffff; color: #1d1d1b; }
          .inv-box { border: 2px solid #333; padding: 25px; border-radius: 8px; }
          .inv-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 15px; }
          .inv-head h2 { margin: 0; color: #005b48; font-size: 20px; }
          .inv-buyer { background: #f7f7f7; border: 1px solid #e0e0e0; padding: 12px; border-radius: 6px; margin-bottom: 15px; font-size: 13px; line-height: 1.8; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 13px; }
          th { background: #333; color: #fff; padding: 8px; text-align: right; }
          td { border-bottom: 1px solid #e0e0e0; padding: 8px; }
          .inv-notice { background: #eaf7f2; border: 1px solid #005b48; padding: 12px; border-radius: 6px; font-size: 12px; color: #004537; margin-bottom: 15px; line-height: 1.6; }
          .inv-foot { display: flex; justify-content: space-between; align-items: center; border-top: 2px solid #333; padding-top: 12px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="inv-box">
          <div class="inv-head">
            <div>
              <h2>پیش‌فاکتور رسمی فروش کالا و خدمات</h2>
              <p>فروشگاه اختصاصی و سامانه توزیع مستقیم مراتع مرد کوهستان</p>
            </div>
            <div style="text-align: left;">
              <strong>شماره فاکتور: ${data.invoiceNumber}</strong><br />
              <small>تاریخ صدور: ${data.date}</small>
            </div>
          </div>
          <div class="inv-buyer">
            <strong>مشخصات خریدار:</strong> ${buyerInfo.name} | <strong>کد ملی:</strong> ${buyerInfo.nationalCode} | <strong>شماره همراه:</strong> ${buyerInfo.phone}<br />
            <strong>نشانی تحویل:</strong> ${buyerInfo.address}
          </div>
          <table>
            <thead>
              <tr><th>ردیف</th><th>شرح کالا</th><th>کد کالا</th><th>وزن</th><th>مبلغ کل</th></tr>
            </thead>
            <tbody>
              ${data.items.map((it: any) => `<tr><td>${it.row}</td><td>${it.name}</td><td>${it.code}</td><td>${it.weight}</td><td>${it.total}</td></tr>`).join("")}
            </tbody>
          </table>
          <div class="inv-notice">
            📌 <strong>تذکر مهم تحویل:</strong> در صورت صحت اطلاعات نشانی و شماره تماس فوق (${buyerInfo.phone})، این سفارش ظرف ۲ الی ۳ روز کاری آینده با حفظ کامل زنجیره سرد (۲.۴°C) تحویل شما می‌گردد. همچنین پیش از اعزام سفیر کوهستان، جهت هماهنگی نهایی ساعت تحویل با شماره همراه شما تماس گرفته خواهد شد.
          </div>
          <div class="inv-foot">
            <div>
              <strong>مبلغ قابل پرداخت: ${data.payableAmount}</strong><br />
              <small>تخفیف سهمیه: ${data.discountQuota}</small>
            </div>
            <div style="text-align: center; border: 1px solid #333; padding: 8px 15px; border-radius: 4px;">
              مُهر مالی و حسابداری<br />سامانه مرد کوهستان
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

  printWindow.document.open();
  printWindow.document.write(contentHtml);
  printWindow.document.close();
}

export function resolveProductImage(name: string, rawImage?: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("عسل") || n.includes("کندو") || n.includes("honey")) {
    return "/brand/home-ready.png";
  }
  if (n.includes("پنیر") || n.includes("cheese") || n.includes("panir")) {
    return "/brand/panir.png";
  }
  if (
    n.includes("کره") ||
    n.includes("روغن") ||
    n.includes("ماست") ||
    n.includes("دوغ") ||
    n.includes("شیر") ||
    n.includes("لبنیات") ||
    n.includes("dairy")
  ) {
    return "/brand/home-dairy.png";
  }
  if (
    n.includes("ماهی") ||
    n.includes("قزل") ||
    n.includes("میگو") ||
    n.includes("آبزیان") ||
    n.includes("seafood") ||
    n.includes("fish")
  ) {
    return "/brand/mahi.png";
  }
  if (
    n.includes("راسته") ||
    n.includes("فیله") ||
    n.includes("ماهیچه") ||
    n.includes("شقه") ||
    n.includes("گوشت") ||
    n.includes("بره") ||
    n.includes("گوساله") ||
    n.includes("گوسفند") ||
    n.includes("پروتئین") ||
    n.includes("قلوه‌گاه") ||
    n.includes("سردست") ||
    n.includes("چرخ‌کرده")
  ) {
    return "/brand/goosht.png";
  }
  if (rawImage && rawImage !== "/brand/home-meat.png" && rawImage.startsWith("/")) {
    return rawImage;
  }
  return "/brand/goosht.png";
}

export const PASTURE_ORDERS_DATABASE = [
  {
    id: "MK-94021",
    title: "بسته گوشت راسته بره و کره محلی",
    date: "۱۰ شهریور ۱۴۰۵",
    pastureName: "مرتع ییلاقی کلاردشت (دامنه مازیچال)",
    altitude: "۲,۲۰۰ متر از سطح دریا",
    grazing: "علوفه وحشی کوهپایه و آویشن ارگانیک",
    vetCode: "IR-88301 نظام دامپزشکی",
    packDate: "۱۰ شهریور ۱۴۰۵ - ۰۶:۳۰",
    tempLog: "۲.۴°C (زنجیره سرد کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "گوشت بره و کره سنتی",
    items: [
      {
        name: "راسته بره مرتعی تازه (۱ کیلوگرم)",
        image: "/brand/goosht.png",
        cut: "برش قصابی استریل · بدون چربی اضافه",
        price: "۵۳۰,۰۰۰ تومان",
      },
      {
        name: "کره سنتی خالص کوهپایه (۵۰۰ گرم)",
        image: "/brand/home-dairy.png",
        cut: "فرآوری ییلاقی با مشک سنتی",
        price: "۲۴۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۷۷۰,۰۰۰ تومان",
    discount: "۴۰,۰۰۰ تومان",
    finalPrice: "۷۳۰,۰۰۰ تومان",
  },
  {
    id: "MK-91823",
    title: "بسته ماهیچه بره و روغن زرد البرز",
    date: "۲۸ مرداد ۱۴۰۵",
    pastureName: "مرتع هزارجریب البرز شرقی",
    altitude: "۲,۵۰۰ متر از سطح دریا",
    grazing: "گیاهان دارویی، کاسنی و پونه کوهی",
    vetCode: "IR-91802 نظام دامپزشکی",
    packDate: "۲۸ مرداد ۱۴۰۵ - ۰۵:۴۵",
    tempLog: "۲.۲°C (زنجیره سرد کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "ماهیچه بره و روغن زرد",
    items: [
      {
        name: "ماهیچه بره تازه ییلاقی (۱.۵ کیلوگرم)",
        image: "/brand/goosht.png",
        cut: "برش پاک‌شده استریل مجلسی",
        price: "۶۵۰,۰۰۰ تومان",
      },
      {
        name: "روغن زرد حیوانی دست‌ساز (۱ کیلوگرم)",
        image: "/brand/home-dairy.png",
        cut: "عطر خالص کوهپایه مازندران",
        price: "۳۰۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۹۵۰,۰۰۰ تومان",
    discount: "۵۰,۰۰۰ تومان",
    finalPrice: "۹۰۰,۰۰۰ تومان",
  },
  {
    id: "MK-88712",
    title: "بسته عسل سبلان و پنیر کهنه کوهستان",
    date: "۱۵ مرداد ۱۴۰۵",
    pastureName: "دامنه‌های سبلان و آبگرم سرعین",
    altitude: "۲,۸۰۰ متر از سطح دریا",
    grazing: "گون و آویشن کوهستانی سبلان",
    vetCode: "IR-77412 نظام دامپزشکی",
    packDate: "۱۵ مرداد ۱۴۰۵ - ۰۶:۰۰",
    tempLog: "۲.۱°C (زنجیره سرد کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "عسل خام و پنیر کوزه‌ای",
    items: [
      {
        name: "عسل خام صخره‌ای سبلان (۱ کیلوگرم)",
        image: "/brand/home-ready.png",
        cut: "برداشت مستقیم کندوهای ییلاق",
        price: "۴۹۰,۰۰۰ تومان",
      },
      {
        name: "پنیر کوزه‌ای کهنه کوهستان (۱ کیلوگرم)",
        image: "/brand/panir.png",
        cut: "رسیده در غارهای طبیعی سرعین",
        price: "۶۶۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۱,۱۵۰,۰۰۰ تومان",
    discount: "۶۰,۰۰۰ تومان",
    finalPrice: "۱,۰۹۰,۰۰۰ تومان",
  },
  {
    id: "MK-76519",
    title: "بسته قزل‌آلای تازه چشمه و عسل کوهی",
    date: "۰۲ مرداد ۱۴۰۵",
    pastureName: "دامنه‌های آب‌شیرین سبلان (قینرجه)",
    altitude: "۲,۶۰۰ متر از سطح دریا",
    grazing: "آب چشمه‌های طبیعی و گیاهان دارویی",
    vetCode: "IR-79104 نظام دامپزشکی",
    packDate: "۰۲ مرداد ۱۴۰۵ - ۰۴:۱۵",
    tempLog: "-۱۸°C منجمد سریع",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "ماهی قزل‌آلا و عسل",
    items: [
      {
        name: "ماهی قزل‌آلای تازه چشمه سبلان (۲ عدد)",
        image: "/brand/mahi.png",
        cut: "پاک‌شده استریل وکیوم",
        price: "۴۲۰,۰۰۰ تومان",
      },
      {
        name: "عسل خالص گون و آویشن کوهستان (۱ کیلو)",
        image: "/brand/home-ready.png",
        cut: "برداشت کندوی ییلاقی بدون شکر",
        price: "۴۵۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۸۷۰,۰۰۰ تومان",
    discount: "۴۰,۰۰۰ تومان",
    finalPrice: "۸۳۰,۰۰۰ تومان",
  },
  {
    id: "MK-65208",
    title: "شقه کامل گوسفند نر مرتع لار",
    date: "۱۸ تیر ۱۴۰۵",
    pastureName: "مرتع دشت لار دماوند",
    altitude: "۲,۴۰۰ متر از سطح دریا",
    grazing: "گیاهان معطر البرز مرکزی",
    vetCode: "IR-65402 نظام دامپزشکی",
    packDate: "۱۸ تیر ۱۴۰۵ - ۰۵:۰۰",
    tempLog: "۲.۶°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "شقه کامل گوسفندی",
    items: [
      {
        name: "شقه گوسفند نر مرتعی (۶ کیلوگرم)",
        image: "/brand/goosht.png",
        cut: "خردشده وکیوم شده خانوادگی",
        price: "۳,۲۰۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۳,۲۰۰,۰۰۰ تومان",
    discount: "۱۵۰,۰۰۰ تومان",
    finalPrice: "۳,۰۵۰,۰۰۰ تومان",
  },
  {
    id: "MK-54311",
    title: "بسته ارگانیک مرغ بومی و ماست دیلمان",
    date: "۲۰ تیر ۱۴۰۵",
    pastureName: "مرتع ییلاقی دیلمان و سیاهکل",
    altitude: "۱,۷۰۰ متر از سطح دریا",
    grazing: "مراتع جنگلی آزاد",
    vetCode: "IR-52190 نظام دامپزشکی",
    packDate: "۲۰ تیر ۱۴۰۵ - ۰۶:۲۰",
    tempLog: "۲.۲°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "جوجه ارگانیک و ماست",
    items: [
      {
        name: "جوجه محلی مرتعی پاک‌شده (۲ عدد)",
        image: "/brand/home-ready.png",
        cut: "تغذیه آزاد در علفزار",
        price: "۳۹۰,۰۰۰ تومان",
      },
      {
        name: "ماست چکیده کوزه سنتی (۱ کیلو)",
        image: "/brand/home-dairy.png",
        cut: "فرآوری شیر تازه گاومیش",
        price: "۱۸۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۵۷۰,۰۰۰ تومان",
    discount: "۳۰,۰۰۰ تومان",
    finalPrice: "۵۴۰,۰۰۰ تومان",
  },
  {
    id: "MK-43210",
    title: "بسته ران بره و کشک سنتی شاهکوه",
    date: "۰۵ تیر ۱۴۰۵",
    pastureName: "مرتع کوهستانی شاهکوه",
    altitude: "۲,۳۵۰ متر از سطح دریا",
    grazing: "درمنه و آویشن کوهی",
    vetCode: "IR-41098 نظام دامپزشکی",
    packDate: "۰۵ تیر ۱۴۰۵ - ۰۵:۱۰",
    tempLog: "۲.۳°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "ران بره و کشک",
    items: [
      {
        name: "ران بره مرتعی درجه یک (۲ کیلوگرم)",
        image: "/brand/goosht.png",
        cut: "برش استیکی بی‌استخوان",
        price: "۱,۱۰۰,۰۰۰ تومان",
      },
      {
        name: "کشک خالص گوسفندی سنتی (۵۰۰ گرم)",
        image: "/brand/home-dairy.png",
        cut: "تهیه شده از دوغ ییلاقی",
        price: "۲۱۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۱,۳۱۰,۰۰۰ تومان",
    discount: "۶۰,۰۰۰ تومان",
    finalPrice: "۱,۲۵۰,۰۰۰ تومان",
  },
  {
    id: "MK-38902",
    title: "بسته گوشت راسته گوساله طالقان",
    date: "۱۸ خرداد ۱۴۰۵",
    pastureName: "مرتع بالاطالقان (علم‌کوه)",
    altitude: "۲,۵۰۰ متر از سطح دریا",
    grazing: "چشمه‌های برفی و گون زرد",
    vetCode: "IR-38112 نظام دامپزشکی",
    packDate: "۱۸ خرداد ۱۴۰۵ - ۰۵:۴۵",
    tempLog: "۲.۴°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "راسته گوساله",
    items: [
      {
        name: "راسته گوساله ییلاقی (۱.۵ کیلوگرم)",
        image: "/brand/goosht.png",
        cut: "برش فیله‌کباب رستورانی",
        price: "۸۷۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۸۷۰,۰۰۰ تومان",
    discount: "۵۰,۰۰۰ تومان",
    finalPrice: "۸۲۰,۰۰۰ تومان",
  },
  {
    id: "MK-31284",
    title: "بسته چرخ‌کرده کوهستانی الموت",
    date: "۰۲ خرداد ۱۴۰۵",
    pastureName: "دره الموت (دریاچه اوان)",
    altitude: "۱,۹۰۰ متر از سطح دریا",
    grazing: "علوفه کوهپایه البرز غربی",
    vetCode: "IR-31005 نظام دامپزشکی",
    packDate: "۰۲ خرداد ۱۴۰۵ - ۰۶:۱۵",
    tempLog: "۲.۰°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "گوشت چرخ‌کرده کوهستان",
    items: [
      {
        name: "چرخ‌کرده گوسفند و گوساله کوهی (۲ کیلو)",
        image: "/brand/goosht.png",
        cut: "ترکیب ۸۰/۲۰ بدون دنبه مازاد",
        price: "۹۸۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۹۸۰,۰۰۰ تومان",
    discount: "۴۰,۰۰۰ تومان",
    finalPrice: "۹۴۰,۰۰۰ تومان",
  },
  {
    id: "MK-29871",
    title: "بسته گردن بره ییلاق ماسال",
    date: "۱۵ اردیبهشت ۱۴۰۵",
    pastureName: "ییلاق اولسبلنگاه ماسال",
    altitude: "۱,۸۰۰ متر از سطح دریا",
    grazing: "مراتع مه‌آلود تالش",
    vetCode: "IR-29440 نظام دامپزشکی",
    packDate: "۱۵ اردیبهشت ۱۴۰۵ - ۰۵:۳۰",
    tempLog: "۲.۵°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "گردن و سردست بره",
    items: [
      {
        name: "گردن بره مرتعی معطر (۱.۵ کیلوگرم)",
        image: "/brand/goosht.png",
        cut: "برش مخصوص چلوگوشت سنتی",
        price: "۷۵۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۷۵۰,۰۰۰ تومان",
    discount: "۳۵,۰۰۰ تومان",
    finalPrice: "۷۱۵,۰۰۰ تومان",
  },
  {
    id: "MK-24150",
    title: "بسته فیله سالمون چشمه فیروزکوه",
    date: "۲۸ فروردین ۱۴۰۵",
    pastureName: "حوضچه چشمه‌های ارجمند فیروزکوه",
    altitude: "۲,۰۵۰ متر از سطح دریا",
    grazing: "آب زلال سرچشمه نمرود",
    vetCode: "IR-23991 نظام دامپزشکی",
    packDate: "۲۸ فروردین ۱۴۰۵ - ۰۴:۵۰",
    tempLog: "-۱۸°C منجمد",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "ماهی سالمون مرتعی",
    items: [
      {
        name: "فیله سالمون نروژی پرورشی چشمه (۱ کیلو)",
        image: "/brand/mahi.png",
        cut: "فیله بدون تیغ استیک",
        price: "۶۸۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۶۸۰,۰۰۰ تومان",
    discount: "۳۰,۰۰۰ تومان",
    finalPrice: "۶۵۰,۰۰۰ تومان",
  },
  {
    id: "MK-19842",
    title: "بسته قلم گوساله و کره سوباتان",
    date: "۱۰ فروردین ۱۴۰۵",
    pastureName: "دشت شقایق سوباتان تالش",
    altitude: "۲,۱۰۰ متر از سطح دریا",
    grazing: "گیاهان کوهی و یونجه وحشی",
    vetCode: "IR-19502 نظام دامپزشکی",
    packDate: "۱۰ فروردین ۱۴۰۵ - ۰۶:۰۰",
    tempLog: "۲.۳°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "کره و قلم گوساله",
    items: [
      {
        name: "قلم و دنده گوساله ییلاقی (۲ کیلوگرم)",
        image: "/brand/goosht.png",
        cut: "برش ویژه آبگوشت و سوپ",
        price: "۵۲۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۵۲۰,۰۰۰ تومان",
    discount: "۲۰,۰۰۰ تومان",
    finalPrice: "۵۰۰,۰۰۰ تومان",
  },
  {
    id: "MK-16503",
    title: "بسته فیله بره الوند تویسرکان",
    date: "۲۰ اسفند ۱۴۰۴",
    pastureName: "دامنه‌های سرکان الوند",
    altitude: "۲,۴۵۰ متر از سطح دریا",
    grazing: "علوفه کوهستان الوند",
    vetCode: "IR-16200 نظام دامپزشکی",
    packDate: "۲۰ اسفند ۱۴۰۴ - ۰۵:۱۵",
    tempLog: "۲.۱°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "فیله بره ممتاز",
    items: [
      {
        name: "فیله بره ممتاز بدون استخوان (۱ کیلو)",
        image: "/brand/goosht.png",
        cut: "برش کبابی باریک استریل",
        price: "۶۹۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۶۹۰,۰۰۰ تومان",
    discount: "۳۰,۰۰۰ تومان",
    finalPrice: "۶۶۰,۰۰۰ تومان",
  },
  {
    id: "MK-12490",
    title: "بسته گوشت تکه‌ای زردکوه بختیاری",
    date: "۰۵ اسفند ۱۴۰۴",
    pastureName: "مرتع چلگرد زردکوه بختیاری",
    altitude: "۲,۷۰۰ متر از سطح دریا",
    grazing: "لاله‌های واژگون و گیاهان آلپی",
    vetCode: "IR-12108 نظام دامپزشکی",
    packDate: "۰۵ اسفند ۱۴۰۴ - ۰۴:۴۰",
    tempLog: "۲.۲°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "گوشت خالص و روغن زرد",
    items: [
      {
        name: "گوشت تکه‌ای خالص گوسفندی (۲ کیلو)",
        image: "/brand/goosht.png",
        cut: "خورشتی مکعبی پاک‌شده",
        price: "۱,۰۵۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۱,۰۵۰,۰۰۰ تومان",
    discount: "۵۰,۰۰۰ تومان",
    finalPrice: "۱,۰۰۰,۰۰۰ تومان",
  },
  {
    id: "MK-08321",
    title: "بسته جگر تازه و پنیر ارسباران",
    date: "۱۸ بهمن ۱۴۰۴",
    pastureName: "جنگل‌ها و مراتع قره‌داغ ارسباران",
    altitude: "۱,۹۵۰ متر از سطح دریا",
    grazing: "پوشش گیاهی حفاظت‌شده ارسباران",
    vetCode: "IR-08092 نظام دامپزشکی",
    packDate: "۱۸ بهمن ۱۴۰۴ - ۰۵:۳۰",
    tempLog: "۲.۴°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "جگر و پنیر تبریز",
    items: [
      {
        name: "جگر، دل و قلوه تازه گوسفندی (۱ دست)",
        image: "/brand/goosht.png",
        cut: "تحویل فوق‌سریع زنجیره سرد",
        price: "۴۸۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۴۸۰,۰۰۰ تومان",
    discount: "۲۰,۰۰۰ تومان",
    finalPrice: "۴۶۰,۰۰۰ تومان",
  },
  /* برگ دوم سفارش‌های قبلی (سفارش‌های ۱۶ تا ۲۸) */
  {
    id: "MK-07844",
    title: "بسته گوشت راسته و پنیر خلخال",
    date: "۰۴ بهمن ۱۴۰۴",
    pastureName: "ییلاقات اسالم به خلخال",
    altitude: "۲,۱۵۰ متر از سطح دریا",
    grazing: "علفزارهای مه‌آلود اردبیل",
    vetCode: "IR-07801 نظام دامپزشکی",
    packDate: "۰۴ بهمن ۱۴۰۴ - ۰۶:۱۰",
    tempLog: "۲.۲°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "راسته گوسفندی و پنیر",
    items: [
      {
        name: "راسته بره تازه خلخال (۱ کیلوگرم)",
        image: "/brand/goosht.png",
        cut: "برش استریل بدون استخوان",
        price: "۵۴۰,۰۰۰ تومان",
      },
      {
        name: "پنیر سنتی گوسفندی خلخال (۵۰۰ گرم)",
        image: "/brand/panir.png",
        cut: "فرآوری طبیعی با شیر تازه",
        price: "۲۱۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۷۵۰,۰۰۰ تومان",
    discount: "۳۰,۰۰۰ تومان",
    finalPrice: "۷۲۰,۰۰۰ تومان",
  },
  {
    id: "MK-06912",
    title: "بسته عسل وحشی و سرشیر سهند",
    date: "۲۰ دی ۱۴۰۴",
    pastureName: "دامنه‌های کوه سهند تبریز",
    altitude: "۲,۴۰۰ متر از سطح دریا",
    grazing: "گون کوهستانی و آویشن وحشی",
    vetCode: "IR-06902 نظام دامپزشکی",
    packDate: "۲۰ دی ۱۴۰۴ - ۰۵:۵۰",
    tempLog: "۲.۰°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "عسل و سرشیر",
    items: [
      {
        name: "عسل وحشی سهند (۱ کیلوگرم)",
        image: "/brand/home-ready.png",
        cut: "برداشت طبیعی صخره‌ای",
        price: "۴۶۰,۰۰۰ تومان",
      },
      {
        name: "سرشیر طبیعی گاومیش (۴۰۰ گرم)",
        image: "/brand/home-dairy.png",
        cut: "تهیه سنتی صبحگاهی",
        price: "۱۹۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۶۵۰,۰۰۰ تومان",
    discount: "۳۰,۰۰۰ تومان",
    finalPrice: "۶۲۰,۰۰۰ تومان",
  },
  {
    id: "MK-05820",
    title: "بسته قزل‌آلا و ماست چکیده لاسم",
    date: "۰۸ دی ۱۴۰۴",
    pastureName: "چشمه‌های لاسم و رینه دماوند",
    altitude: "۲,۳۰۰ متر از سطح دریا",
    grazing: "آب زلال سرچشمه هراز",
    vetCode: "IR-05810 نظام دامپزشکی",
    packDate: "۰۸ دی ۱۴۰۴ - ۰۴:۳۰",
    tempLog: "-۱۸°C منجمد سریع",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "ماهی قزل‌آلا و ماست",
    items: [
      {
        name: "ماهی قزل‌آلای تازه چشمه هراز (۲ عدد)",
        image: "/brand/mahi.png",
        cut: "پاک‌شده وکیوم شده",
        price: "۴۳۰,۰۰۰ تومان",
      },
      {
        name: "ماست چکیده کوهستانی (۱ کیلو)",
        image: "/brand/home-dairy.png",
        cut: "تهیه شده در مشک پوستی",
        price: "۱۷۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۶۰۰,۰۰۰ تومان",
    discount: "۲۵,۰۰۰ تومان",
    finalPrice: "۵۷۵,۰۰۰ تومان",
  },
  {
    id: "MK-04901",
    title: "بسته گوشت خورشتی و روغن تالش",
    date: "۲۲ آذر ۱۴۰۴",
    pastureName: "ییلاقات مریان و تندبین تالش",
    altitude: "۱,۹۰۰ متر از سطح دریا",
    grazing: "گیاهان معطر مرتعی کاسپین",
    vetCode: "IR-04911 نظام دامپزشکی",
    packDate: "۲۲ آذر ۱۴۰۴ - ۰۶:۰۰",
    tempLog: "۲.۱°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "گوشت گوساله و روغن",
    items: [
      {
        name: "گوشت مغز ران گوساله ییلاقی (۱.۵ کیلو)",
        image: "/brand/goosht.png",
        cut: "برش مکعبی خورشتی پاک‌شده",
        price: "۸۲۰,۰۰۰ تومان",
      },
      {
        name: "روغن حیوانی اعلا (۵۰۰ گرم)",
        image: "/brand/home-dairy.png",
        cut: "عطر اصیل کره محلی",
        price: "۲۶۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۱,۰۸۰,۰۰۰ تومان",
    discount: "۵۰,۰۰۰ تومان",
    finalPrice: "۱,۰۳۰,۰۰۰ تومان",
  },
  {
    id: "MK-03820",
    title: "بسته ماهیچه گوسفندی دشت مغان",
    date: "۱۰ آذر ۱۴۰۴",
    pastureName: "مراتع قشلاقی دشت مغان",
    altitude: "۸۰۰ متر از سطح دریا",
    grazing: "یونجه مرغوب ارس",
    vetCode: "IR-03814 نظام دامپزشکی",
    packDate: "۱۰ آذر ۱۴۰۴ - ۰۵:۱۵",
    tempLog: "۲.۳°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "ماهیچه بره مغان",
    items: [
      {
        name: "ماهیچه بره تازه مغان (۲ کیلوگرم)",
        image: "/brand/goosht.png",
        cut: "برش پاک‌شده قلم‌دار مجلسی",
        price: "۹۴۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۹۴۰,۰۰۰ تومان",
    discount: "۴۰,۰۰۰ تومان",
    finalPrice: "۹۰۰,۰۰۰ تومان",
  },
  {
    id: "MK-02940",
    title: "بسته پنیر کهنه و عسل سبلان",
    date: "۲۵ آبان ۱۴۰۴",
    pastureName: "دامنه‌های موئیل و مشگین‌شهر",
    altitude: "۲,۲۰۰ متر از سطح دریا",
    grazing: "آویشن کوهی و گیاهان دارویی",
    vetCode: "IR-02944 نظام دامپزشکی",
    packDate: "۲۵ آبان ۱۴۰۴ - ۰۶:۴۵",
    tempLog: "۲.۰°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "پنیر کهنه و عسل",
    items: [
      {
        name: "پنیر کوزه‌ای کهنه ۶ ماهه (۱ کیلو)",
        image: "/brand/panir.png",
        cut: "رسیده در غار طبیعی سبلان",
        price: "۶۵۰,۰۰۰ تومان",
      },
      {
        name: "عسل خام کوهستانی (۱ کیلوگرم)",
        image: "/brand/home-ready.png",
        cut: "برداشت کندوی ییلاقی",
        price: "۴۸۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۱,۱۳۰,۰۰۰ تومان",
    discount: "۶۰,۰۰۰ تومان",
    finalPrice: "۱,۰۷۰,۰۰۰ تومان",
  },
  {
    id: "MK-02110",
    title: "بسته استیک فیله گوساله دنا",
    date: "۱۲ آبان ۱۴۰۴",
    pastureName: "مراتع کوهستانی دنا و زاگرس",
    altitude: "۲,۶۰۰ متر از سطح دریا",
    grazing: "بلوط و علفزارهای وحشی",
    vetCode: "IR-02102 نظام دامپزشکی",
    packDate: "۱۲ آبان ۱۴۰۴ - ۰۵:۳۰",
    tempLog: "۲.۱°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "استیک فیله زاگرس",
    items: [
      {
        name: "فیله گوساله بدون چربی زاگرس (۱.۵ کیلو)",
        image: "/brand/goosht.png",
        cut: "برش استیک مدالیون فوق‌العاده",
        price: "۹۱۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۹۱۰,۰۰۰ تومان",
    discount: "۴۰,۰۰۰ تومان",
    finalPrice: "۸۷۰,۰۰۰ تومان",
  },
  {
    id: "MK-01580",
    title: "بسته کره ییلاقی و کشک سمیرم",
    date: "۲۸ مهر ۱۴۰۴",
    pastureName: "مراتع آبشار سمیرم و پادنا",
    altitude: "۲,۳۰۰ متر از سطح دریا",
    grazing: "چشمه‌های برفی دنا",
    vetCode: "IR-01588 نظام دامپزشکی",
    packDate: "۲۸ مهر ۱۴۰۴ - ۰۶:۱۰",
    tempLog: "۲.۲°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "کره محلی و کشک",
    items: [
      {
        name: "کره حیوانی مشک سمیرم (۱ کیلوگرم)",
        image: "/brand/home-dairy.png",
        cut: "تهیه سنتی با دوغ ییلاقی",
        price: "۴۸۰,۰۰۰ تومان",
      },
      {
        name: "کشک خالص گوسفندی سنتی (۵۰۰ گرم)",
        image: "/brand/home-dairy.png",
        cut: "خشک‌شده در آفتاب کوهستان",
        price: "۲۲۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۷۰۰,۰۰۰ تومان",
    discount: "۳۰,۰۰۰ تومان",
    finalPrice: "۶۷۰,۰۰۰ تومان",
  },
  {
    id: "MK-01001",
    title: "پکیج شاهانه مهمانی کندوان",
    date: "۱۴ مهر ۱۴۰۴",
    pastureName: "مرتع البرز مرکزی (کندوان)",
    altitude: "۲,۸۰۰ متر از سطح دریا",
    grazing: "علوفه بکر ارتفاعات سهند و البرز",
    vetCode: "IR-01001 نظام دامپزشکی",
    packDate: "۱۴ مهر ۱۴۰۴ - ۰۵:۰۰",
    tempLog: "۲.۰°C (کنترل‌شده)",
    status: "تحویل‌شده با زنجیره سرد",
    boxCategory: "پکیج کامل مرتعی",
    items: [
      {
        name: "ست کامل راسته، فیله و ماهیچه (۴ کیلو)",
        image: "/brand/goosht.png",
        cut: "بسته‌بندی شاهانه گلد مرتع",
        price: "۲,۹۵۰,۰۰۰ تومان",
      },
    ],
    totalAmount: "۲,۹۵۰,۰۰۰ تومان",
    discount: "۱۵۰,۰۰۰ تومان",
    finalPrice: "۲,۸۰۰,۰۰۰ تومان",
  },
];

function ProfileContent() {
  const { user, isLoading, openLoginModal, updateUserProfile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get("tab") as ActiveTab) || "personal";
  /** Carousel focus — arrows, drag, URL */
  const [focusedTab, setFocusedTab] = useState<ActiveTab>("personal");
  /** Workspace content — only after explicit card click */
  const [openedTab, setOpenedTab] = useState<ActiveTab | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const aiThreadRef = useRef<HTMLDivElement>(null);

  // Edit profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalCode, setNationalCode] = useState("۰۰۱۸۴۹۲۷۵۱");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("تهران، زعفرانیه");
  const [signatureText, setSignatureText] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeat, setNewPasswordRepeat] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);

  // AI Assistant state
  const [aiMessages, setAiMessages] = useState(INITIAL_AI_MESSAGES);
  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(50000);
  const [greenPoints, setGreenPoints] = useState(120);
  const [chargeAmount, setChargeAmount] = useState("100000");
  const [walletMsg, setWalletMsg] = useState<string | null>(null);

  // Delivery Addresses State
  const [addresses, setAddresses] = useState<CustomerAddress[]>([
    {
      id: 1,
      title: "نشانی منزل",
      address_type: "home",
      province: "تهران",
      city: "تهران",
      district: "زعفرانیه",
      address_line: "خیابان آصف، کمالی، بنفشه، پلاک ۱۲",
      postal_code: "۱۹۸۷۶۵۴۳۲۱",
      receiver_name: "کامیار جعفریان",
      receiver_phone: "۰۹۳۷۹۱۴۶۱۳۰",
      is_default: true,
    },
    {
      id: 2,
      title: "نشانی دفتر",
      address_type: "work",
      province: "تهران",
      city: "تهران",
      district: "فرمانیه",
      address_line: "بلوار اندرزگو، سلیمی شمالی، ساختمان نگین",
      postal_code: "۱۹۳۴۵۶۷۸۹۰",
      receiver_name: "کامیار جعفریان",
      receiver_phone: "۰۹۳۷۹۱۴۶۱۳۰",
      is_default: false,
    },
  ]);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Orders & Shopping Cart State
  const {
    cart,
    itemsCount: cartItemsCount,
    totalPriceToman: cartTotalPriceToman,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  } = useCart();
  const [userOrders, setUserOrders] = useState<ApiOrder[]>([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(null);
  const [docViewMode, setDocViewMode] = useState<"book" | "invoice">("book");

  // Payment Gateway simulation state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payCardNum, setPayCardNum] = useState("۶۰۳۷ - ۹۹۷۵ - ۴۸۲۱ - ۳۰۱۴");
  const [payCvv2, setPayCvv2] = useState("۸۲۴");
  const [payOtp, setPayOtp] = useState("");
  const [payOtpTimer, setPayOtpTimer] = useState(120);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  // Subscription plan selection
  const [selectedPlan, setSelectedPlan] = useState<"standard" | "family" | "gourmet">("family");

  useEffect(() => {
    if (tabParam && ["personal", "ai-nutrition", "wallet", "subscription", "orders"].includes(tabParam)) {
      setFocusedTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (user) {
      setName(user.name || "کامیار جعفریان");
      setPhone(user.phone || "۰۹۳۷۹۱۴۶۱۳۰");
      setEmail(user.email || "grifindorekamyar@gmail.com");
      setSignatureText(user.name || "کامیار جعفریان");
      try {
        const savedAvatar = localStorage.getItem(`mk_avatar_${user.id || user.email || "user"}`);
        if (savedAvatar) {
          setAvatarUrl(savedAvatar);
        }
      } catch {}

      getUserAddresses()
        .then((data) => {
          if (data && data.length > 0) {
            setAddresses(data);
          }
        })
        .catch(() => {
          // fallback to defaults
        });

      fetchUserOrders()
        .then((data) => {
          if (data && data.length > 0) {
            setUserOrders(data);
          }
        })
        .catch(() => {
          // fallback to defaults
        });
    }
  }, [user]);

  const handleOpenEditAddress = (addr: CustomerAddress) => {
    setEditingAddress({ ...addr });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;
    setIsSavingAddress(true);
    try {
      if (editingAddress.id) {
        const updated = await updateAddress(editingAddress.id, editingAddress);
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await createAddress(editingAddress);
        setAddresses((prev) => [...prev, created]);
      }
      setIsAddressModalOpen(false);
      setEditingAddress(null);
      setProfileSuccessMsg("نشانی تحویل مرسوله با موفقیت در سامانه و پنل ادمین ثبت شد.");
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err) {
      setProfileErrorMsg(authErrorMessage(err));
      setTimeout(() => setProfileErrorMsg(null), 4000);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileErrorMsg("لطفاً یک فایل تصویری معتبر انتخاب کنید.");
      setTimeout(() => setProfileErrorMsg(null), 3500);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMsg("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
      setTimeout(() => setProfileErrorMsg(null), 3500);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
      try {
        localStorage.setItem(`mk_avatar_${user?.id || user?.email || "user"}`, dataUrl);
      } catch {}
      setProfileSuccessMsg("تصویر پرسنلی شناسنامه با موفقیت به‌روزرسانی شد.");
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const displayName = name.trim() || user?.name || "کاربر کوهستان";

  const ordersList = useMemo(() => {
    if (userOrders.length > 0) {
      return userOrders.map((ord) => {
        const primaryItemName = ord.items[0]?.product_name
          ? ord.items[0].product_name.split(" (")[0]
          : `بسته سفارش مرتع`;
        const autoTitle =
          ord.items.length > 1
            ? `${primaryItemName} و اقلام ییلاقی مرتع`
            : primaryItemName;

        return {
          id: ord.order_number,
          title: autoTitle,
          date: ord.pack_date,
          pastureName: ord.pasture_name,
          altitude: ord.altitude,
          grazing: ord.grazing_info,
          vetCode: ord.vet_code,
          packDate: ord.pack_date,
          tempLog: ord.temperature_log,
          status: ord.status_display || "تحویل‌شده با زنجیره سرد",
          boxCategory: primaryItemName.includes("عسل") ? "عسل و لبنیات" : "پروتئین مرتعی",
          items: ord.items.map((it) => ({
            name: it.product_name,
            image: resolveProductImage(it.product_name, it.product_image),
            cut: it.cut_type || it.portion || "بسته‌بندی استریل مرتع",
            price: `${it.total_price_toman.toLocaleString("fa-IR")} تومان`,
          })),
          totalAmount: `${ord.total_amount_toman.toLocaleString("fa-IR")} تومان`,
          discount: `${ord.discount_amount_toman.toLocaleString("fa-IR")} تومان`,
          finalPrice: `${ord.final_amount_toman.toLocaleString("fa-IR")} تومان`,
        };
      });
    }
    return PASTURE_ORDERS_DATABASE.map((ord) => ({
      ...ord,
      items: ord.items.map((it) => ({
        ...it,
        image: resolveProductImage(it.name, it.image),
      })),
    }));
  }, [userOrders]);

  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 15;

  const totalOrdersPages = Math.max(1, Math.ceil(ordersList.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (ordersCurrentPage - 1) * ORDERS_PER_PAGE;
    return ordersList.slice(start, start + ORDERS_PER_PAGE);
  }, [ordersList, ordersCurrentPage]);

  const activeOrder =
    selectedOrderIndex !== null && ordersList[selectedOrderIndex]
      ? ordersList[selectedOrderIndex]
      : ordersList[0] || null;

  const buyerInfo = {
    name: displayName,
    nationalCode: nationalCode || "۰۰۱۸۴۹۲۷۵۱",
    phone: phone || "۰۹۳۷۹۱۴۶۱۳۰",
    address: addresses[0]
      ? `${addresses[0].city}، ${addresses[0].district}، ${addresses[0].address_line}`
      : "تهران، زعفرانیه، خیابان آصف، پلاک ۱۲",
  };

  const handleRequestOtp = () => {
    setIsOtpSent(true);
    setPayOtpTimer(120);
    setPayOtp("۷۴۸۲");
  };

  const handleSimulatePayment = async () => {
    setIsPaying(true);
    try {
      if (cart && cart.items && cart.items.length > 0) {
        await checkoutUserCart({
          receiver_name: buyerInfo.name,
          receiver_phone: buyerInfo.phone,
          shipping_address: buyerInfo.address,
        });
        await refreshCart();
        const updated = await fetchUserOrders();
        setUserOrders(updated);
        setSelectedOrderIndex(0);
      } else {
        setSelectedOrderIndex(0);
      }
    } catch {
      setSelectedOrderIndex(0);
    } finally {
      setIsPaying(false);
      setPaySuccess(true);
      setTimeout(() => {
        setIsPayModalOpen(false);
        setPaySuccess(false);
        setDocViewMode("book");
      }, 2000);
    }
  };

  const handleFocusChange = useCallback(
    (tab: ActiveTab) => {
      setFocusedTab(tab);
      setOpenedTab(null);
      if (tab === "orders") return;
      router.replace(`/profile?tab=${tab}`, { scroll: false });
    },
    [router]
  );

  const handleCardOpen = useCallback(
    (tab: ActiveTab) => {
      if (tab === "orders") {
        const token = getAccessToken();
        if (token) setAccessToken(token);
        window.open("/profile/orders", "_blank", "noopener,noreferrer");
        return;
      }
      setFocusedTab(tab);
      setOpenedTab(tab);
      router.replace(`/profile?tab=${tab}`, { scroll: false });
    },
    [router]
  );

  const handleCloseWorkspace = useCallback(() => {
    setOpenedTab(null);
  }, []);

  useEffect(() => {
    if (!openedTab || !workspaceRef.current) return;
    workspaceRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [openedTab]);

  useEffect(() => {
    if (openedTab !== "ai-nutrition" || !aiThreadRef.current) return;
    aiThreadRef.current.scrollTop = aiThreadRef.current.scrollHeight;
  }, [aiMessages, aiTyping, openedTab]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("is-profile-scene");
    return () => {
      root.classList.remove("is-profile-scene");
      root.classList.remove("is-profile-workspace");
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("is-profile-workspace", openedTab !== null);
  }, [openedTab]);

  const currentIdx = COVERFLOW_ITEMS.findIndex((item) => item.id === focusedTab);
  const selectedIndex = currentIdx >= 0 ? currentIdx : 0;
  const openedIdx = openedTab
    ? COVERFLOW_ITEMS.findIndex((item) => item.id === openedTab)
    : -1;
  const openedItem = openedIdx >= 0 ? COVERFLOW_ITEMS[openedIdx] : null;
  const hasUserAiMessage = aiMessages.some((msg) => msg.sender === "user");
  const userInitial = displayName.trim().charAt(0) || "ک";

  const handlePrevCard = () => {
    const nextIdx = (selectedIndex - 1 + COVERFLOW_ITEMS.length) % COVERFLOW_ITEMS.length;
    handleFocusChange(COVERFLOW_ITEMS[nextIdx].id);
  };

  const handleNextCard = () => {
    const nextIdx = (selectedIndex + 1) % COVERFLOW_ITEMS.length;
    handleFocusChange(COVERFLOW_ITEMS[nextIdx].id);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        handleNextCard();
      } else if (e.key === "ArrowRight") {
        handlePrevCard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);
    setIsUpdatingProfile(true);

    try {
      if (updateUserProfile) {
        await updateUserProfile({
          name: name.trim(),
          phone: phone.trim(),
        });
      }
      setProfileSuccessMsg("اطلاعات شناسنامه با موفقیت ثبت و تأیید شد.");
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err) {
      setProfileErrorMsg(authErrorMessage(err));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg(null);
    setPassSuccessMsg(null);

    if (newPassword.length < 10) {
      setPassErrorMsg("هنوز شل است. حداقل ده نویسه.");
      return;
    }
    if (newPassword !== newPasswordRepeat) {
      setPassErrorMsg("دو رمز یکی نیستند.");
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        newPasswordRepeat,
      });
      setPassSuccessMsg("قفل عوض شد.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordRepeat("");
    } catch (err) {
      setPassErrorMsg(authErrorMessage(err));
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleSendAiMessage = (userPrompt?: string) => {
    const textToSend = userPrompt || aiInput.trim();
    if (!textToSend || aiTyping) return;

    const userMsg = {
      sender: "user",
      text: textToSend,
      time: "همین الان",
    };

    setAiMessages((prev) => [...prev, userMsg]);
    if (!userPrompt) setAiInput("");
    setAiTyping(true);

    setTimeout(() => {
      let reply = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("گوشت") || lower.includes("راسته") || lower.includes("بره") || lower.includes("پخت")) {
        reply = "برای گوشت راسته گوسفندی مرتع مرد کوهستان:\n\n۱. به دلیل تغذیه طبیعی دام در ارتفاعات البرز و بافت بسیار لطیف، نیازی به مرینیت طولانی با اسیدهای تند ندارید.\n۲. فقط با کمی روغن زیتون فرابکر، رزماری کوهی و فلفل سیاه نیم‌کوب آغشته کنید.\n۳. در تابه چدنی بسیار داغ هر طرف را ۳ تا ۴ دقیقه تفت دهید تا آبدار بماند.\n۴. قبل از برش، ۳ دقیقه استراحت دهید تا میوگلوبین و ارزش پروتئینی آن در بافت حفظ شود.";
      } else if (lower.includes("برنامه") || lower.includes("رژیم") || lower.includes("پروتئین")) {
        reply = "برنامه ۳ روزه پروتئین سالم با محصولات سبز مرد کوهستان:\n\n• روز اول: فیله مرغ بدون آنتی‌بیوتیک + خوراک سبزیجات معطر مزرعه + روغن زیتون طبیعی\n• روز دوم: ماهی قزل‌آلای آب سرد کبابی + دوغ سنتی و پروبیوتیک کوهپایه\n• روز سوم: فیله گوسفند مرتعی با پوره سیب‌زمینی تنوری و سبزیجات خشک کوهستان\n\nاین ترکیب روزانه به طور میانگین ۱۱۰ گرم پروتئین خالص بدون چربی مضر تامین می‌کند.";
      } else if (lower.includes("ماهی") || lower.includes("دریایی") || lower.includes("قزل")) {
        reply = "ماهی قزل‌آلای مرد کوهستان در جریان آب خنک و پر از اکسیژن چشمه‌های طبیعی رشد می‌کند. به همین خاطر:\n• بافت آن بدون بو و کاملاً منسجم و صورتی است.\n• سرشار از اسیدهای چرب امگا ۳ فعال و فسفر طبیعی است.\n• در مقایسه با استخرهای متراکم، میزان پروتئین خالص آن بیشتر و فاقد چربی سنگین است.";
      } else if (lower.includes("کره") || lower.includes("روغن") || lower.includes("کتو")) {
        reply = "روغن حیوانی و کره سنتی مرد کوهستان از شیر دوشیده‌شده در مراتع ییلاقی تولید می‌شود. این محصولات حاوی CLA و ویتامین‌های محلول در چربی هستند که در رژیم کتوژنیک به عنوان سوخت پاک برای سلول‌ها و افزایش انرژی پایدار روزانه عمل می‌کنند.";
      } else {
        reply = "غذای طبیعی سلامت تن و آرامش روان را می‌سازد. محصولات مرد کوهستان از منبع مرتع و مزرعه بدون ماده نگه‌دارنده به دست شما می‌رسد. می‌توانید محصولات پروتئینی، لبنی و ارگانیک را از بخش محصولات سفارش دهید و ارزش غذایی هر کدام را در شناسنامه مزرعه ببینید.";
      }

      setAiMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: reply,
          time: "چند ثانیه پیش",
        },
      ]);
      setAiTyping(false);
    }, 1100);
  };

  const handleChargeWallet = () => {
    const amount = parseInt(chargeAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    setWalletBalance((prev) => prev + amount);
    setGreenPoints((prev) => prev + Math.floor(amount / 10000));
    setWalletMsg(`کیف پول شما با موفقیت به مبلغ ${amount.toLocaleString("fa-IR")} تومان شارژ شد.`);
    setTimeout(() => setWalletMsg(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="profile-page-wrapper">
        <ProfileSceneBackdrop />
        <div className="profile-loading-screen">
          <div className="profile-loading-spinner" />
          <p>در حال فراخوانی اطلاعات همسفر سبز…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page-wrapper">
        <ProfileSceneBackdrop />
        <div className="profile-guest-card">
          <div className="profile-guest-inner">
            <Image
              src="/brand/orginal-clear.png"
              alt="مرد کوهستان"
              width={72}
              height={72}
              className="profile-guest-logo"
            />
            <h2>ورود به باشگاه راه سبز</h2>
            <p>برای مشاهده پنل اختصاصی، اطلاعات فردی، دستیار هوشمند و کیف پول، لطفاً وارد حساب خود شوید.</p>
            <button
              type="button"
              className="profile-btn-primary"
              onClick={openLoginModal}
            >
              ورود / عضویت در خانواده مرد کوهستان
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      <section className="profile-scene">
        <ProfileSceneBackdrop isWorkspaceOpen={openedTab !== null} />

        <motion.div
          className="profile-scene-stage"
          animate={{
            opacity: openedTab !== null ? 0 : 1,
            scale: openedTab !== null ? 0.9 : 1,
            y: openedTab !== null ? -36 : 0,
            filter: openedTab !== null ? "blur(25px) brightness(0.15)" : "blur(0px) brightness(1)",
            pointerEvents: openedTab !== null ? "none" : "auto",
            display: openedTab !== null ? "none" : "flex",
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="profile-scene-kicker">
            <span className="profile-coverflow-kicker-en">Marde Koohestan</span>
            <span className="profile-coverflow-kicker-sep" aria-hidden="true" />
            <span className="profile-coverflow-kicker-fa">این راه سبز است</span>
          </div>
          <h2 className="profile-coverflow-title">میز کاربری و خدمات اختصاصی کوهستان</h2>
          <p className="profile-coverflow-sub">
            حساب، تغذیه، اعتبار و مسیر سفارش روی یک میز. قاب وسط را باز کنید · با فلش‌ها میان خدمات جابه‌جا شوید.
          </p>

          <div className="profile-coverflow-stage">
            <button
              type="button"
              className="coverflow-nav-btn is-prev"
              onClick={handlePrevCard}
              aria-label="بخش قبلی"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            <motion.div
              className="profile-coverflow-track"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x > 50 || info.velocity.x > 300) {
                  handlePrevCard();
                } else if (info.offset.x < -50 || info.velocity.x < -300) {
                  handleNextCard();
                }
              }}
            >
              {COVERFLOW_ITEMS.map((item, idx) => (
                <InteractiveCard
                  key={item.id}
                  item={item}
                  index={idx}
                  selectedIndex={selectedIndex}
                  onSelect={() => handleCardOpen(item.id)}
                />
              ))}
            </motion.div>

            <button
              type="button"
              className="coverflow-nav-btn is-next"
              onClick={handleNextCard}
              aria-label="بخش بعدی"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {openedTab !== null && openedItem && (
          <div className="shell profile-workspace-shell">
            <motion.div
              className="profile-workspace-section"
              data-theme={openedTab}
              ref={workspaceRef}
              style={{
                ["--desk-print" as string]: `url(${
                  openedTab === "ai-nutrition"
                    ? "/brand/profile/ai-mist-companions.png"
                    : openedTab === "personal"
                    ? "/brand/profile/personal-ledger-desk.png"
                    : openedItem.image
                })`,
              }}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 25, scale: 0.97 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {openedTab !== "ai-nutrition" && openedTab !== "personal" && openedTab !== "orders" && (
                <header className="desk-pane-header">
                  <div className="desk-pane-header-main">
                    <div className="desk-pane-thumb">
                      <Image src={openedItem.image} alt="" fill sizes="56px" />
                    </div>
                    <div>
                      <span className="desk-pane-kicker">{openedItem.badge}</span>
                      <h2>{openedItem.title}</h2>
                      <p>{openedItem.subtitle}</p>
                    </div>
                  </div>
                  <button type="button" className="desk-pane-close" onClick={handleCloseWorkspace}>
                    بستن
                  </button>
                </header>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={openedTab}
                  className="desk-pane-body"
                  initial={{ opacity: 0, y: 18, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 0.99 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Tab 1: Personal Info & Security */}
                  {openedTab === "personal" && (
                    <div className="mk-ledger">
                      <motion.header
                        className="mk-ledger-topbar"
                        initial={{ opacity: 0, y: -14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="mk-ledger-brand">
                          <Image
                            src="/brand/orginal-clear.png"
                            alt="مرد کوهستان"
                            width={36}
                            height={36}
                            className="mk-ledger-logo"
                          />
                          <div className="mk-ledger-titles">
                            <strong>میز اختصاصی هویت و امنیت همسفر</strong>
                            <span>باشگاه مشتریان و سلامت خانواده مرد کوهستان</span>
                          </div>
                          <span className="mk-ledger-live">
                            <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" strokeWidth="2.5" fill="none">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            احراز هویت سطح یک
                          </span>
                        </div>
                        <button type="button" className="mk-ledger-close" onClick={handleCloseWorkspace}>
                          <span>بستن میز</span>
                          <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" fill="none">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </motion.header>

                      <div className="mk-ledger-scroll">
                        <div className="mk-ledger-desk">
                          {/* ============================================================
                              COLUMN 1: AUTHENTIC SHENASNAMEH BOOKLET (Right in RTL)
                             ============================================================ */}
                          <motion.form
                            className="mk-shenasnameh"
                            onSubmit={handleProfileSubmit}
                            aria-labelledby="shenasnameh-title"
                            initial={{ opacity: 0, y: 22, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <span className="mk-safe-bolt is-tr" aria-hidden="true" />
                            <span className="mk-safe-bolt is-tl" aria-hidden="true" />
                            <span className="mk-safe-bolt is-br" aria-hidden="true" />
                            <span className="mk-safe-bolt is-bl" aria-hidden="true" />
                            
                            {/* Leatherette Spine */}
                            <div className="mk-shenasnameh-spine" aria-hidden="true">
                              <span>شناسنامه همسفر · NATIONAL ID BOOKLET</span>
                            </div>

                            {/* Cream Parchment Document Sheet */}
                            <div className="mk-shenasnameh-page">
                              {/* Background Security Border Guilloche */}
                              <svg className="mk-shenasnameh-guilloche" viewBox="0 0 500 580" aria-hidden="true">
                                <rect x="8" y="8" width="484" height="564" rx="4" fill="none" stroke="#005B48" strokeWidth="0.8" opacity="0.22" />
                                <rect x="14" y="14" width="472" height="552" rx="3" fill="none" stroke="#D4A359" strokeWidth="0.6" strokeDasharray="5 3" opacity="0.38" />
                                <circle cx="20" cy="20" r="10" fill="none" stroke="#D4A359" strokeWidth="0.8" opacity="0.4" />
                                <circle cx="480" cy="20" r="10" fill="none" stroke="#D4A359" strokeWidth="0.8" opacity="0.4" />
                                <circle cx="20" cy="560" r="10" fill="none" stroke="#D4A359" strokeWidth="0.8" opacity="0.4" />
                                <circle cx="480" cy="560" r="10" fill="none" stroke="#D4A359" strokeWidth="0.8" opacity="0.4" />
                              </svg>

                              {/* Official Document Header */}
                              <header className="mk-shenasnameh-head">
                                <div className="mk-shenasnameh-head-top">
                                  <span className="mk-shenasnameh-org">جمهوری اسلامی ایران · اسناد هویت باشگاه مرد کوهستان</span>
                                  <span className="mk-shenasnameh-serial">سری الف/۲۶ · ۳۸۴۹۱۸</span>
                                </div>
                                <div className="mk-shenasnameh-head-main">
                                  <Image
                                    src="/brand/orginal-clear.png"
                                    alt="نشان رسمی مرد کوهستان"
                                    width={38}
                                    height={38}
                                    className="mk-shenasnameh-crest"
                                  />
                                  <div className="mk-shenasnameh-head-titles">
                                    <strong id="shenasnameh-title" className="mk-shenasnameh-title-fa">شناسنامهٔ همسفر راه سبز</strong>
                                    <span className="mk-shenasnameh-title-en">NATIONAL IDENTITY FOLIO · MARDE KOOHESTAN</span>
                                  </div>
                                </div>
                              </header>

                              {profileSuccessMsg && (
                                <div className="mk-shenasnameh-alert is-ok" role="status">
                                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  {profileSuccessMsg}
                                </div>
                              )}
                              {profileErrorMsg && (
                                <div className="mk-shenasnameh-alert is-bad" role="alert">{profileErrorMsg}</div>
                              )}

                              {/* Body: Photo on Side + Clean Essential Fields */}
                              <div className="mk-shenasnameh-body">
                                {/* Photo Mount with Real Upload, Embossed Seal & Biometrics */}
                                <div className="mk-shenasnameh-side">
                                  <div className="mk-shenasnameh-photo-wrap">
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      style={{ display: "none" }}
                                      onChange={handlePhotoFileChange}
                                      aria-label="بارگذاری تصویر پرسنلی شناسنامه"
                                    />
                                    <div
                                      className="mk-shenasnameh-photo"
                                      onClick={handlePhotoClick}
                                      role="button"
                                      tabIndex={0}
                                      title="برای تغییر عکس شناسنامه کلیک کنید"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          handlePhotoClick();
                                        }
                                      }}
                                    >
                                      <span className="mk-shenasnameh-corner-mount is-tl" />
                                      <span className="mk-shenasnameh-corner-mount is-tr" />
                                      <span className="mk-shenasnameh-corner-mount is-bl" />
                                      <span className="mk-shenasnameh-corner-mount is-br" />
                                      <span className="mk-shenasnameh-foil" aria-hidden="true" />

                                      {avatarUrl ? (
                                        <img
                                          src={avatarUrl}
                                          alt="عکس پرسنلی صاحب شناسنامه"
                                          className="mk-shenasnameh-user-img"
                                        />
                                      ) : (
                                        <>
                                          <strong>{userInitial}</strong>
                                          <small>عکس صاحب سند</small>
                                        </>
                                      )}

                                      <div className="mk-shenasnameh-photo-overlay" aria-hidden="true">
                                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.3" fill="none">
                                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                          <circle cx="12" cy="13" r="4" />
                                        </svg>
                                        <span>تغییر عکس</span>
                                      </div>
                                    </div>

                                    <div className="mk-shenasnameh-embossed-seal" aria-hidden="true">
                                      <svg viewBox="0 0 100 100" width="56" height="56">
                                        <circle cx="50" cy="50" r="46" fill="none" stroke="#D4A359" strokeWidth="1.6" strokeDasharray="4 2" />
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#005B48" strokeWidth="0.9" />
                                        <path id="curve-seal" d="M 18 50 A 32 32 0 1 1 82 50" fill="none" />
                                        <text fill="#005B48" fontSize="6.5" fontWeight="900">
                                          <textPath href="#curve-seal" startOffset="50%" textAnchor="middle">
                                            مرد کوهستان · احراز هویت
                                          </textPath>
                                        </text>
                                        <text x="50" y="54" fill="#903828" fontSize="6.5" fontWeight="900" textAnchor="middle">
                                          تأیید شد
                                        </text>
                                      </svg>
                                    </div>
                                  </div>
                                  <span className="mk-shenasnameh-verified-badge">
                                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="3" fill="none">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    احراز سجلی
                                  </span>
                                </div>

                                {/* Clean Necessary Fields & Green Records */}
                                <div className="mk-shenasnameh-fields">
                                  {/* Row 1: Full Name */}
                                  <div className="mk-shenasnameh-field is-locked">
                                    <div className="mk-shenasnameh-label-row">
                                      <label>نام و نام خانوادگی</label>
                                      <span className="mk-shenasnameh-lock-tag">
                                        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                                        </svg>
                                        قفل هویتی
                                      </span>
                                    </div>
                                    <div className="mk-shenasnameh-val-row">
                                      <strong>{name || "کامیار جعفریان"}</strong>
                                      <small>FULL NAME</small>
                                    </div>
                                  </div>

                                  {/* Row 2: National ID + Phone */}
                                  <div className="mk-shenasnameh-dual-row">
                                    <div className="mk-shenasnameh-field is-locked">
                                      <div className="mk-shenasnameh-label-row">
                                        <label>شماره ملی</label>
                                        <span className="mk-shenasnameh-lock-tag">ثبت احوال</span>
                                      </div>
                                      <div className="mk-shenasnameh-val-row">
                                        <strong dir="ltr">{nationalCode}</strong>
                                        <small>NATIONAL ID</small>
                                      </div>
                                    </div>

                                    <div className="mk-shenasnameh-field is-locked">
                                      <div className="mk-shenasnameh-label-row">
                                        <label>شماره همراه</label>
                                        <span className="mk-shenasnameh-lock-tag">تأیید پیامکی</span>
                                      </div>
                                      <div className="mk-shenasnameh-val-row">
                                        <strong dir="ltr">{phone || "۰۹۳۷۹۱۴۶۱۳۰"}</strong>
                                        <small>MOBILE PHONE</small>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Row 3: Email + City (Editable) */}
                                  <div className="mk-shenasnameh-dual-row">
                                    <div className="mk-shenasnameh-field is-editable">
                                      <label htmlFor="shenas-email">
                                        <em>رایانامه / ایمیل ارتباطی</em>
                                        <span className="mk-shenasnameh-edit-badge">قابل ویرایش</span>
                                      </label>
                                      <input
                                        id="shenas-email"
                                        type="email"
                                        dir="ltr"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="yourname@domain.com"
                                      />
                                    </div>

                                    <div className="mk-shenasnameh-field is-editable">
                                      <label htmlFor="shenas-city">
                                        <em>شهر سکونت / محدوده تحویل</em>
                                        <span className="mk-shenasnameh-edit-badge">قابل ویرایش</span>
                                      </label>
                                      <input
                                        id="shenas-city"
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="مثال: تهران، زعفرانیه"
                                      />
                                    </div>
                                  </div>

                                  {/* Row 4: Pasture Tier + Green Points (Official Records - Locked) */}
                                  <div className="mk-shenasnameh-dual-row">
                                    <div className="mk-shenasnameh-field is-locked">
                                      <div className="mk-shenasnameh-label-row">
                                        <label>سطح و رتبه همسفری</label>
                                        <span className="mk-shenasnameh-lock-tag">باشگاه سلامت</span>
                                      </div>
                                      <div className="mk-shenasnameh-val-row">
                                        <strong>الماس سبز · پیشکسوت مرتع</strong>
                                        <small>MEMBERSHIP TIER</small>
                                      </div>
                                    </div>

                                    <div className="mk-shenasnameh-field is-locked">
                                      <div className="mk-shenasnameh-label-row">
                                        <label>اندوخته امتیاز سبز مرتع</label>
                                        <span className="mk-shenasnameh-lock-tag">محیط‌زیست</span>
                                      </div>
                                      <div className="mk-shenasnameh-val-row">
                                        <strong>{greenPoints} امتیاز سلامت</strong>
                                        <small>GREEN HEALTH POINTS</small>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Row 5: Cold Chain Delivery + Account Category (Locked) */}
                                  <div className="mk-shenasnameh-dual-row">
                                    <div className="mk-shenasnameh-field is-locked">
                                      <div className="mk-shenasnameh-label-row">
                                        <label>تحویل‌های زنجیره سرد</label>
                                        <span className="mk-shenasnameh-lock-tag">۲.۴°C فعال</span>
                                      </div>
                                      <div className="mk-shenasnameh-val-row">
                                        <strong>۷ بسته تحویل موفق</strong>
                                        <small>COLD CHAIN DELIVERIES</small>
                                      </div>
                                    </div>

                                    <div className="mk-shenasnameh-field is-locked">
                                      <div className="mk-shenasnameh-label-row">
                                        <label>نوع حساب و رده مشتری</label>
                                        <span className="mk-shenasnameh-lock-tag">شخصی / سازمانی</span>
                                      </div>
                                      <div className="mk-shenasnameh-val-row">
                                        <strong>حقیقی · مشتری خانوادگی</strong>
                                        <small>ACCOUNT CLASSIFICATION</small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Dedicated Official Seal & Certificate Centerpiece */}
                              <div className="mk-shenasnameh-centerpiece">
                                <div className="mk-shenasnameh-center-content">
                                  {/* Right Wing: Organic Cold Chain */}
                                  <div className="mk-shenasnameh-pillar is-right">
                                    <div className="mk-pillar-icon">
                                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="#005B48" strokeWidth="2.2" fill="none">
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                      </svg>
                                    </div>
                                    <div className="mk-pillar-info">
                                      <strong>نشان اصالت مرتع و تغذیه پاک</strong>
                                      <span>پروتئین سالم · زنجیره سرد ۲.۴°C</span>
                                    </div>
                                  </div>

                                  {/* Unified Precision Medallion Seal */}
                                  <div className="mk-shenasnameh-seal-medallion">
                                    <svg viewBox="0 0 140 140" className="mk-seal-svg" width="92" height="92" aria-hidden="true">
                                      <circle cx="70" cy="70" r="67" fill="none" stroke="#D4A359" strokeWidth="1.4" strokeDasharray="3 2" opacity="0.85" />
                                      <circle cx="70" cy="70" r="63" fill="#F4F0E8" stroke="#005B48" strokeWidth="1.8" />
                                      <circle cx="70" cy="70" r="49" fill="none" stroke="#D4A359" strokeWidth="0.9" strokeDasharray="2 2" />
                                      <circle cx="70" cy="70" r="45" fill="#005B48" stroke="#D4A359" strokeWidth="1" />
                                      <circle cx="70" cy="70" r="33" fill="#FFFFFF" stroke="#005B48" strokeWidth="1.2" />

                                      {/* Curved Text along Outer Circle */}
                                      <path id="seal-text-top" d="M 21 70 A 49 49 0 1 1 119 70" fill="none" />
                                      <path id="seal-text-bot" d="M 119 70 A 49 49 0 1 1 21 70" fill="none" />
                                      
                                      <text fill="#005B48" fontSize="6.4" fontWeight="900" letterSpacing="0.06em">
                                        <textPath href="#seal-text-top" startOffset="50%" textAnchor="middle">
                                          باشگاه رسمی مرد کوهستان
                                        </textPath>
                                      </text>
                                      <text fill="#8A652E" fontSize="5.6" fontWeight="900" letterSpacing="0.08em">
                                        <textPath href="#seal-text-bot" startOffset="50%" textAnchor="middle">
                                          THIS WAY IS GREEN · راه سبز
                                        </textPath>
                                      </text>
                                    </svg>
                                    <div className="mk-seal-center-logo">
                                      <Image
                                        src="/brand/orginal-clear.png"
                                        alt="نشان رسمی مرد کوهستان"
                                        width={42}
                                        height={42}
                                        priority
                                        className="mk-seal-logo-img"
                                      />
                                    </div>
                                  </div>

                                  {/* Left Wing: Official Membership Code */}
                                  <div className="mk-shenasnameh-pillar is-left">
                                    <div className="mk-pillar-icon">
                                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="#005B48" strokeWidth="2.2" fill="none">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                      </svg>
                                    </div>
                                    <div className="mk-pillar-info">
                                      <strong>شناسه سجلی همسفر سلامت</strong>
                                      <span dir="ltr">MK-94021-IR</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Signature & Security Seal Footer */}
                              <div className="mk-shenasnameh-foot">
                                <div className="mk-shenasnameh-sign-card">
                                  <div className="mk-shenasnameh-sign-header">
                                    <div className="mk-shenasnameh-sign-title">
                                      <svg viewBox="0 0 24 24" width="11" height="11" stroke="#005B48" strokeWidth="2.4" fill="none">
                                        <path d="M12 19l7-7 3 3-7 7-3-3z" />
                                        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                                        <path d="M2 2l7.586 7.586" />
                                      </svg>
                                      <span>امضای رسمی صاحب سند</span>
                                    </div>
                                    <span className="mk-shenasnameh-sign-badge">ثبت دیجیتال</span>
                                  </div>

                                  <div className="mk-shenasnameh-sign-stage">
                                    <div className="mk-shenasnameh-sign-text-wrap">
                                      <input
                                        id="shenas-sign"
                                        type="text"
                                        value={signatureText}
                                        onChange={(e) => setSignatureText(e.target.value)}
                                        placeholder="نام امضاکننده"
                                        className="mk-shenasnameh-sign-input"
                                      />
                                      <span className="mk-shenasnameh-sign-name">{signatureText || displayName}</span>
                                      {/* Calligraphic Flourish Underline */}
                                      <svg className="mk-shenasnameh-sign-flourish" viewBox="0 0 170 30" fill="none" aria-hidden="true">
                                        <path
                                          d="M 4 20 C 35 28, 75 8, 115 22 C 142 30, 162 16, 156 6 C 150 -3, 128 4, 136 18 C 142 26, 162 26, 168 22"
                                          stroke="#903828"
                                          strokeWidth="2.2"
                                          strokeLinecap="round"
                                          fill="none"
                                          opacity="0.88"
                                        />
                                      </svg>
                                    </div>

                                    <div className="mk-shenasnameh-sign-stamp" aria-hidden="true">
                                      <svg viewBox="0 0 40 40" width="30" height="30">
                                        <circle cx="20" cy="20" r="18" fill="none" stroke="#903828" strokeWidth="1.2" strokeDasharray="3 2" />
                                        <circle cx="20" cy="20" r="15" fill="none" stroke="#903828" strokeWidth="0.7" />
                                        <text x="20" y="23" fill="#903828" fontSize="6.5" fontWeight="900" textAnchor="middle">
                                          مُهر امضا
                                        </text>
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                <div className="mk-shenasnameh-mrz" aria-hidden="true">
                                  <span>{toMrz("IDIRN<<SHENASNAMEH<<MARDE<KOOHESTAN")}</span>
                                  <span>{toMrz(`${nationalCode}<${email || user.email}`)}</span>
                                </div>

                                <button type="submit" disabled={isUpdatingProfile} className="mk-shenasnameh-submit-btn">
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                  </svg>
                                  {isUpdatingProfile ? "در حال ثبت تغییرات…" : "مهر و ثبت اطلاعات شناسنامه"}
                                </button>
                              </div>
                            </div>
                          </motion.form>

                          {/* ============================================================
                              COLUMN 2: SECURITY VAULT + DELIVERY PACKETS (Left in RTL)
                             ============================================================ */}
                          <div className="mk-ledger-side">
                            {/* Card 2A: Security Vault */}
                            <motion.form
                              className="mk-safe"
                              onSubmit={handleChangePasswordSubmit}
                              aria-labelledby="safe-title"
                              initial={{ opacity: 0, y: 22, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <span className="mk-safe-bolt is-tr" aria-hidden="true" />
                              <span className="mk-safe-bolt is-tl" aria-hidden="true" />
                              <span className="mk-safe-bolt is-br" aria-hidden="true" />
                              <span className="mk-safe-bolt is-bl" aria-hidden="true" />

                              <header className="mk-safe-head">
                                <div className="mk-safe-title-wrap">
                                  <span className="mk-safe-kicker">SECURITY VAULT</span>
                                  <h3 id="safe-title">گاوصندوق و امنیت</h3>
                                </div>
                                <motion.div
                                  className="mk-safe-dial"
                                  aria-hidden="true"
                                  animate={{ rotate: newPassword ? newPassword.length * 28 : 0 }}
                                  transition={{ type: "spring", stiffness: 180, damping: 18 }}
                                >
                                  <span className="mk-safe-dial-ring" />
                                  <span className="mk-safe-dial-ring is-mid" />
                                  <span className="mk-safe-dial-core" />
                                </motion.div>
                              </header>

                              <div className="mk-safe-cavity">
                                {passSuccessMsg && (
                                  <div className="mk-safe-alert is-ok" role="status">{passSuccessMsg}</div>
                                )}
                                {passErrorMsg && (
                                  <div className="mk-safe-alert is-bad" role="alert">{passErrorMsg}</div>
                                )}

                                <div className="mk-safe-inputs-grid">
                                  <div className="mk-safe-field">
                                    <div className="mk-safe-field-head">
                                      <label htmlFor="prof-cur-pass">
                                        <svg viewBox="0 0 24 24" width="13" height="13" stroke="#D4A359" strokeWidth="2.2" fill="none">
                                          <circle cx="7.5" cy="15.5" r="4.5" />
                                          <path d="M10.5 12.5L20 3M16 7l2 2M13 10l2 2" />
                                        </svg>
                                        <span>رمز عبور فعلی گاوصندوق</span>
                                      </label>
                                    </div>
                                    <LedgerSecretField
                                      id="prof-cur-pass"
                                      value={currentPassword}
                                      onChange={setCurrentPassword}
                                      placeholder="••••••••"
                                      autoComplete="current-password"
                                      required
                                    />
                                  </div>

                                  <div className="mk-safe-field">
                                    <div className="mk-safe-field-head">
                                      <label htmlFor="prof-new-pass">
                                        <svg viewBox="0 0 24 24" width="13" height="13" stroke="#D4A359" strokeWidth="2.2" fill="none">
                                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                        <span>رمز عبور تازه</span>
                                      </label>
                                      {newPassword ? (
                                        <span className={`mk-safe-tight${newPassword.length < 10 ? " is-loose" : ""}`}>
                                          <span className="mk-safe-tight-dot" />
                                          {folioLockWord(newPassword)}
                                        </span>
                                      ) : null}
                                    </div>
                                    <LedgerSecretField
                                      id="prof-new-pass"
                                      value={newPassword}
                                      onChange={setNewPassword}
                                      placeholder="حداقل ۱۰ نویسه امنیتی"
                                      autoComplete="new-password"
                                      required
                                    />
                                  </div>

                                  <div className="mk-safe-field">
                                    <div className="mk-safe-field-head">
                                      <label htmlFor="prof-new-pass-rep">
                                        <svg viewBox="0 0 24 24" width="13" height="13" stroke="#D4A359" strokeWidth="2.2" fill="none">
                                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                          <polyline points="9 12 11 14 15 10"/>
                                        </svg>
                                        <span>تکرار رمز عبور تازه</span>
                                      </label>
                                    </div>
                                    <LedgerSecretField
                                      id="prof-new-pass-rep"
                                      value={newPasswordRepeat}
                                      onChange={setNewPasswordRepeat}
                                      placeholder="تکرار رمز عبور تازه"
                                      autoComplete="new-password"
                                      required
                                    />
                                  </div>
                                </div>

                                <button type="submit" disabled={isChangingPass} className="mk-safe-turn">
                                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                  </svg>
                                  {isChangingPass ? "در حال قفل…" : "قفل گاوصندوق و ذخیره رمز"}
                                </button>
                              </div>
                            </motion.form>

                            {/* Card 2B: Cold Chain Delivery Packets */}
                            <motion.section
                              className="mk-mail"
                              aria-labelledby="folio-mail-title"
                              initial={{ opacity: 0, y: 22, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.55, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <span className="mk-safe-bolt is-tr" aria-hidden="true" />
                              <span className="mk-safe-bolt is-tl" aria-hidden="true" />
                              <span className="mk-safe-bolt is-br" aria-hidden="true" />
                              <span className="mk-safe-bolt is-bl" aria-hidden="true" />
                              <header className="mk-mail-head">
                                <div className="mk-mail-title-wrap">
                                  <span className="mk-mail-kicker">COLD CHAIN LOGISTICS · موقعیت تحویل</span>
                                  <h3 id="folio-mail-title">پاکت‌های تحویل سفارش</h3>
                                </div>
                                <span className="mk-mail-cold-tag">
                                  <span className="mk-mail-dot" />
                                  ۲.۴°C زنجیره سرد فعال
                                </span>
                              </header>
                              <div className="mk-mail-row">
                                {addresses.slice(0, 2).map((addr, idx) => {
                                  const isHome = addr.address_type === "home" || addr.title.includes("منزل");
                                  const typeLabel =
                                    addr.address_type === "home"
                                      ? "تحویل خانوادگی"
                                      : addr.address_type === "work"
                                      ? "محل کار / اداری"
                                      : "نشانی سفارش";

                                  return (
                                    <article
                                      key={addr.id || idx}
                                      className={`mk-packet${isHome ? " is-home" : " is-work"}`}
                                      onClick={() => handleOpenEditAddress(addr)}
                                      role="button"
                                      tabIndex={0}
                                      title="کلیک برای مشاهده و ویرایش نشانی"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                          e.preventDefault();
                                          handleOpenEditAddress(addr);
                                        }
                                      }}
                                    >
                                      {/* Topographic Geo Matrix Background Watermark */}
                                      <div className="mk-packet-geo-watermark" aria-hidden="true">
                                        <svg viewBox="0 0 200 100" className="mk-geo-grid-svg">
                                          <defs>
                                            <pattern id={`geo-grid-${idx}`} width="16" height="16" patternUnits="userSpaceOnUse">
                                              <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#D4A359" strokeWidth="0.4" opacity="0.2" />
                                            </pattern>
                                          </defs>
                                          <rect width="100%" height="100%" fill={`url(#geo-grid-${idx})`} />
                                          <circle cx="160" cy="30" r="24" fill="none" stroke="#50AF47" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
                                          <circle cx="160" cy="30" r="12" fill="none" stroke="#D4A359" strokeWidth="0.6" opacity="0.4" />
                                          <circle cx="160" cy="30" r="3" fill="#D4A359" opacity="0.75" />
                                        </svg>
                                      </div>

                                      {/* Top Header: Title, 3D Pin & Classification Tag */}
                                      <div className="mk-packet-top">
                                        <div className="mk-packet-lead">
                                          <span className={`mk-packet-pin${isHome ? " is-home" : " is-work"}`}>
                                            <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
                                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                            </svg>
                                          </span>
                                          <div className="mk-packet-title-box">
                                            <h4>{addr.title || (isHome ? "نشانی منزل" : "نشانی دفتر")}</h4>
                                            <span className="mk-packet-type-text">{typeLabel}</span>
                                          </div>
                                        </div>

                                        <div className="mk-packet-route-chip">
                                          <span className="mk-route-radar-dot" />
                                          <span>{addr.district || (isHome ? "زعفرانیه" : "فرمانیه")}</span>
                                        </div>
                                      </div>

                                      {/* Geo City & Postal Code Info Row */}
                                      <div className="mk-packet-meta-row">
                                        <div className="mk-packet-meta-item">
                                          <svg viewBox="0 0 24 24" width="11" height="11" stroke="#D4A359" strokeWidth="2.2" fill="none">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                          </svg>
                                          <span>{addr.province || "تهران"}، {addr.city}</span>
                                        </div>
                                        <div className="mk-packet-meta-item is-postal">
                                          <svg viewBox="0 0 24 24" width="11" height="11" stroke="#86C2EB" strokeWidth="2.2" fill="none">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                          </svg>
                                          <span>
                                            کد پستی:{" "}
                                            <strong dir="ltr">{addr.postal_code ? addr.postal_code : "ثبت‌نشده (اختیاری)"}</strong>
                                          </span>
                                        </div>
                                      </div>

                                      {/* Detailed Address Line Box */}
                                      <div className="mk-packet-body">
                                        <div className="mk-packet-address-wrap">
                                          <svg viewBox="0 0 24 24" width="11" height="11" stroke="#50AF47" strokeWidth="2.2" fill="none" className="mk-packet-addr-icon">
                                            <circle cx="12" cy="12" r="10" />
                                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                                          </svg>
                                          <p className="mk-packet-address-text">{addr.address_line}</p>
                                        </div>
                                      </div>

                                      {/* Recipient & Contact Row */}
                                      <div className="mk-packet-contact-row">
                                        <div className="mk-packet-contact-item">
                                          <svg viewBox="0 0 24 24" width="10" height="10" stroke="#D4A359" strokeWidth="2.2" fill="none">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                          </svg>
                                          <span>گیرنده: <strong>{addr.receiver_name || displayName}</strong></span>
                                        </div>
                                        <div className="mk-packet-contact-item" dir="ltr">
                                          <svg viewBox="0 0 24 24" width="10" height="10" stroke="#50AF47" strokeWidth="2.2" fill="none">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                          </svg>
                                          <span>{addr.receiver_phone || phone || "۰۹۳۷۹۱۴۶۱۳۰"}</span>
                                        </div>
                                      </div>

                                      {/* Footer: Priority Badge & Edit Action */}
                                      <div className="mk-packet-foot">
                                        <div className="mk-packet-status-group">
                                          {addr.is_default ? (
                                            <span className="mk-packet-active-pill">
                                              <svg viewBox="0 0 24 24" width="9" height="9" stroke="currentColor" strokeWidth="3" fill="none">
                                                <polyline points="20 6 9 17 4 12" />
                                              </svg>
                                              نشانی پیش‌فرض
                                            </span>
                                          ) : (
                                            <span className="mk-packet-active-pill is-secondary">{isHome ? "منزل" : "محل کار"}</span>
                                          )}
                                          <span className="mk-packet-cold-state">۲.۴°C آماده تحویل</span>
                                        </div>

                                        <button
                                          type="button"
                                          className="mk-packet-edit-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEditAddress(addr);
                                          }}
                                          title="ویرایش این نشانی"
                                        >
                                          <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2.4" fill="none">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                          </svg>
                                          <span>ویرایش</span>
                                        </button>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            </motion.section>
                          </div>
                        </div>
                      </div>

                      {/* Address Edit / Creation Modal */}
                      <AnimatePresence>
                        {isAddressModalOpen && editingAddress && (
                          <div className="mk-address-modal-backdrop" onClick={() => setIsAddressModalOpen(false)}>
                            <motion.div
                              className="mk-address-modal-card"
                              onClick={(e) => e.stopPropagation()}
                              initial={{ opacity: 0, scale: 0.95, y: 12 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 12 }}
                              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <header className="mk-address-modal-head">
                                <div className="mk-address-modal-title">
                                  <div className="mk-address-modal-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="#005B48" strokeWidth="2.3" fill="none">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                  </div>
                                  <div>
                                    <h3>ویرایش نشانی تحویل مرسوله</h3>
                                    <p>ثبت رسمی نشانی در سامانه لجستیک زنجیره سرد و پنل مدیریت مرد کوهستان</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="mk-address-modal-close"
                                  onClick={() => setIsAddressModalOpen(false)}
                                  aria-label="بستن پنجره"
                                >
                                  ✕
                                </button>
                              </header>

                              <form onSubmit={handleSaveAddress} className="mk-address-modal-form">
                                <div className="mk-modal-grid-2">
                                  <div className="mk-modal-field">
                                    <label htmlFor="addr-title">عنوان نشانی</label>
                                    <input
                                      id="addr-title"
                                      type="text"
                                      value={editingAddress.title}
                                      onChange={(e) => setEditingAddress({ ...editingAddress, title: e.target.value })}
                                      placeholder="مثال: نشانی منزل، دفتر، ویلا"
                                      required
                                    />
                                  </div>

                                  <div className="mk-modal-field">
                                    <label htmlFor="addr-type">نوع کاربری نشانی</label>
                                    <select
                                      id="addr-type"
                                      value={editingAddress.address_type}
                                      onChange={(e) => setEditingAddress({ ...editingAddress, address_type: e.target.value as "home" | "work" | "other" })}
                                    >
                                      <option value="home">منزل (تحویل خانوادگی)</option>
                                      <option value="work">محل کار / دفتر اداری</option>
                                      <option value="other">سایر نشانی‌ها</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="mk-modal-grid-2">
                                  <div className="mk-modal-field">
                                    <label htmlFor="addr-city">شهر و استان</label>
                                    <input
                                      id="addr-city"
                                      type="text"
                                      value={editingAddress.city}
                                      onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                                      placeholder="مثال: تهران"
                                      required
                                    />
                                  </div>

                                  <div className="mk-modal-field">
                                    <label htmlFor="addr-district">منطقه / محله</label>
                                    <input
                                      id="addr-district"
                                      type="text"
                                      value={editingAddress.district}
                                      onChange={(e) => setEditingAddress({ ...editingAddress, district: e.target.value })}
                                      placeholder="مثال: زعفرانیه، فرمانیه، شهرک غرب"
                                    />
                                  </div>
                                </div>

                                <div className="mk-modal-field">
                                  <label htmlFor="addr-line">نشانی کامل پستی (خیابان، کوچه، پلاک، واحد)</label>
                                  <textarea
                                    id="addr-line"
                                    rows={2}
                                    value={editingAddress.address_line}
                                    onChange={(e) => setEditingAddress({ ...editingAddress, address_line: e.target.value })}
                                    placeholder="مثال: خیابان آصف، خیابان کمالی، کوچه بنفشه، پلاک ۱۲، واحد ۴"
                                    required
                                  />
                                </div>

                                <div className="mk-modal-grid-3">
                                  <div className="mk-modal-field">
                                    <label htmlFor="addr-receiver">تحویل‌گیرنده</label>
                                    <input
                                      id="addr-receiver"
                                      type="text"
                                      value={editingAddress.receiver_name}
                                      onChange={(e) => setEditingAddress({ ...editingAddress, receiver_name: e.target.value })}
                                      placeholder={displayName}
                                    />
                                  </div>

                                  <div className="mk-modal-field">
                                    <label htmlFor="addr-phone">تلفن هماهنگی</label>
                                    <input
                                      id="addr-phone"
                                      type="text"
                                      dir="ltr"
                                      value={editingAddress.receiver_phone}
                                      onChange={(e) => setEditingAddress({ ...editingAddress, receiver_phone: e.target.value })}
                                      placeholder="۰۹۳۷۹۱۴۶۱۳۰"
                                    />
                                  </div>

                                  <div className="mk-modal-field">
                                    <label htmlFor="addr-postal">کد پستی (اختیاری)</label>
                                    <input
                                      id="addr-postal"
                                      type="text"
                                      dir="ltr"
                                      value={editingAddress.postal_code}
                                      onChange={(e) => setEditingAddress({ ...editingAddress, postal_code: e.target.value })}
                                      placeholder="۱۰ رقم (اختیاری)"
                                    />
                                  </div>
                                </div>

                                <div className="mk-modal-checkbox-row">
                                  <label className="mk-modal-check-label">
                                    <input
                                      type="checkbox"
                                      checked={editingAddress.is_default}
                                      onChange={(e) => setEditingAddress({ ...editingAddress, is_default: e.target.checked })}
                                    />
                                    <span>تعیین به عنوان نشانی پیش‌فرض دریافت سفارش‌های پروتئینی</span>
                                  </label>
                                </div>

                                <footer className="mk-address-modal-foot">
                                  <button
                                    type="button"
                                    className="mk-modal-cancel-btn"
                                    onClick={() => setIsAddressModalOpen(false)}
                                  >
                                    انصراف
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={isSavingAddress}
                                    className="mk-modal-save-btn"
                                  >
                                    {isSavingAddress ? "در حال ثبت و ذخیره…" : "ثبت و ذخیره رسمی نشانی"}
                                  </button>
                                </footer>
                              </form>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

              {openedTab === "ai-nutrition" && (
                <div className={`mk-chat${hasUserAiMessage ? " is-chatting" : ""}`}>
                  <div className="mk-chat-stage">
                    <Image
                      src="/brand/profile/ai-mist-companions.png"
                      alt="مرد کوهستان و دستیار هوشمند در مه کوهستان"
                      fill
                      sizes="100vw"
                      quality={92}
                      priority
                      className="mk-chat-scene-img"
                    />
                    <span className="mk-chat-scene-veil" aria-hidden="true" />
                    <header className="mk-chat-topbar">
                      <div className="mk-chat-brand">
                        <Image
                          src="/brand/orginal-clear.png"
                          alt="مرد کوهستان"
                          width={32}
                          height={32}
                          className="mk-chat-logo"
                        />
                        <strong>دستیار تغذیه</strong>
                        <span className="mk-chat-live">آنلاین</span>
                      </div>
                      <div className="mk-chat-actions">
                        <button
                          type="button"
                          className="mk-chat-new"
                          onClick={() => {
                            setAiMessages(INITIAL_AI_MESSAGES);
                            setAiInput("");
                          }}
                        >
                          گفتگوی تازه
                        </button>
                        <button
                          type="button"
                          className="mk-chat-close"
                          onClick={handleCloseWorkspace}
                        >
                          بستن
                        </button>
                      </div>
                    </header>
                    {!hasUserAiMessage && (
                      <aside className="mk-speech" aria-label="گفتگوی دستیار">
                        <div className="mk-speech-cloud">
                          <h2>خب، از کجا کمکت کنیم؟</h2>
                          <p className="mk-chat-said">
                            گوشت مرتع، یه شام درست، یا برنامهٔ روزانه‌ت. بگو دلت چی می‌خواد؛ راه سبز بازه.
                          </p>
                        </div>
                        <span className="mk-speech-puff is-mid" aria-hidden="true" />
                        <span className="mk-speech-puff is-tip" aria-hidden="true" />
                      </aside>
                    )}
                    {hasUserAiMessage && (
                      <div className="mk-chat-thread" ref={aiThreadRef}>
                        <div className="mk-chat-feed">
                          {aiMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`mk-chat-row ${msg.sender === "user" ? "is-user" : "is-assistant"}`}
                            >
                              {msg.sender === "assistant" ? (
                                <Image
                                  src="/brand/orginal-clear.png"
                                  alt=""
                                  width={36}
                                  height={36}
                                  className="mk-chat-avatar"
                                />
                              ) : (
                                <span className="mk-chat-user-mark" aria-hidden="true">
                                  {userInitial}
                                </span>
                              )}
                              <div className="mk-chat-bubble">
                                <AiMessageBody text={msg.text} />
                                <span className="mk-chat-time">{msg.time}</span>
                              </div>
                            </div>
                          ))}
                          {aiTyping && (
                            <div className="mk-chat-row is-assistant">
                              <Image
                                src="/brand/orginal-clear.png"
                                alt=""
                                width={36}
                                height={36}
                                className="mk-chat-avatar"
                              />
                              <div className="mk-chat-typing" aria-label="در حال نوشتن">
                                <span />
                                <span />
                                <span />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`mk-chat-dock${hasUserAiMessage ? " is-chatting" : ""}`}>
                    {!hasUserAiMessage && (
                      <div className="mk-chat-starters">
                        {AI_PROMPTS.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="mk-chat-starter"
                            onClick={() => handleSendAiMessage(prompt)}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendAiMessage();
                      }}
                      className="mk-chat-composer"
                    >
                      <div className="mk-chat-composer-inner">
                        <input
                          type="text"
                          placeholder="از ما بپرسید؛ از گوشت مرتع تا رژیم و طبخ…"
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={aiTyping || !aiInput.trim()}
                          className="mk-chat-send"
                          aria-label="ارسال پیام"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 3: Green Way Wallet & Loyalty */}
                  {openedTab === "wallet" && (
                <div className="profile-tab-pane">
                  <div className="profile-grid-deck">
                    {/* Wallet Balance & Recharge */}
                    <div className="profile-card">
                      <div className="profile-card-header">
                        <h3>کیف پول و اعتبار سبز</h3>
                        <p>اعتبار نقدی برای خرید بی‌واسطه و سریع با تخفیف‌های ویژه همسفران.</p>
                      </div>

                      <div className="mk-leather-card">
                        <span className="mk-leather-kicker">باشگاه راه سبز</span>
                        <span className="mk-leather-name">{displayName}</span>
                        <div className="mk-leather-balance">
                          <em>موجودی در دسترس</em>
                          <strong>
                            {walletBalance.toLocaleString("fa-IR")}
                            <span>تومان</span>
                          </strong>
                        </div>
                      </div>
                      <p className="mk-leather-gift">شامل ۵۰,۰۰۰ تومان هدیه عضویت باشگاه راه سبز</p>

                      {walletMsg && (
                        <div className="profile-alert profile-alert--success">
                          <span>{walletMsg}</span>
                        </div>
                      )}

                      <div className="profile-wallet-charge-form">
                        <label htmlFor="charge-input">افزایش اعتبار کیف پول</label>
                        <div className="profile-wallet-charge-row">
                          <input
                            id="charge-input"
                            type="number"
                            step="50000"
                            value={chargeAmount}
                            onChange={(e) => setChargeAmount(e.target.value)}
                            placeholder="مبلغ به تومان"
                          />
                          <button
                            type="button"
                            className="profile-btn-primary"
                            onClick={handleChargeWallet}
                          >
                            افزایش اعتبار آنلاین
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Green Points & Loyalty Badges */}
                    <div className="profile-card">
                      <div className="profile-card-header">
                        <h3>امتیازهای کوهستان و جوایز</h3>
                        <p>با هر سفارش و اشتراک هفتگی، امتیاز سبز کسب کنید و کوپن تخفیف بگیرید.</p>
                      </div>

                      <div className="mk-coin-row">
                        <span className="mk-coin" aria-hidden="true">سکه</span>
                        <div className="profile-points-meta">
                          <strong>{greenPoints} امتیاز سبز</strong>
                          <span>معادل ۲۴,۰۰۰ تومان تخفیف روی سفارش بعدی</span>
                        </div>
                      </div>

                      <div className="profile-coupons-list">
                        <div className="profile-coupon-item">
                          <div className="profile-coupon-info">
                            <strong>تخفیف ۲۰٪ اولین سفارش گوشت مرتعی</strong>
                            <span>کد: SABZ-RAH-20</span>
                          </div>
                          <button
                            type="button"
                            className="profile-btn-copy"
                            onClick={() => alert("کد تخفیف SABZ-RAH-20 کپی شد!")}
                          >
                            کپی کد
                          </button>
                        </div>

                        <div className="profile-coupon-item">
                          <div className="profile-coupon-info">
                            <strong>ارسال رایگان در زنجیره سرد برای خریدهای بالای ۵۰۰ هزار تومان</strong>
                            <span>اعمال خودکار در سبد خرید</span>
                          </div>
                          <span className="profile-coupon-active-badge">فعال</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Fresh Subscription Box Preview */}
                  <div className="profile-card profile-card--full">
                    <div className="profile-subscription-box">
                      <div className="profile-sub-content">
                        <span className="profile-sub-kicker">سرویس ویژه همسفران</span>
                        <h3>اشتراک هفتگی «سبد تازه کوهستان»</h3>
                        <p>
                          هر هفته در روز انتخابی شما، ترکیب دلخواهی از پروتئین تازه، لبنیات سنتی کوهپایه و سبزیجات ارگانیک مستقیماً با زنجیره سرد درب منزل تحویل داده می‌شود.
                        </p>
                        <ul className="profile-sub-features">
                          <li>✓ ۱۰٪ تخفیف ثابت روی تمام محصولات اشتراکی</li>
                          <li>✓ اولویت در تحویل برش‌های خاص گوشت مرتع</li>
                          <li>✓ امکان لغو یا تغییر روز ارسال در هر لحظه بدون جریمه</li>
                        </ul>
                        <button
                          type="button"
                          className="profile-btn-primary"
                          onClick={() => handleCardOpen("subscription")}
                        >
                          تنظیم و فعال‌سازی سبد هفتگی
                        </button>
                      </div>
                      <div className="profile-sub-image-wrap">
                        <Image
                          src="/brand/profile/card-profile-subscription.png"
                          alt="سبد تازه مرد کوهستان"
                          width={220}
                          height={280}
                          className="profile-sub-img"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Subscription Configuration */}
                  {openedTab === "subscription" && (
                <div className="profile-tab-pane">
                  <div className="profile-card profile-card--full">
                    <div className="profile-card-header">
                      <h3>پیکربندی و انتخاب بسته اشتراک هفتگی مرتع</h3>
                      <p>بسته مورد نظر خود را برای تحویل منظم هفتگی با تخفیف دائمی و زنجیره سرد سفارشی‌سازی کنید.</p>
                    </div>

                    <div className="profile-sub-configurator">
                      <div
                        className={`profile-sub-plan-card ${selectedPlan === "standard" ? "is-selected" : ""}`}
                        onClick={() => setSelectedPlan("standard")}
                      >
                        <span className="crate-tag">سبد انفرادی</span>
                        <h4>سبد انفرادی / زوج (سبک زندگی سالم)</h4>
                        <p>شامل ۲ کیلوگرم فیله و راسته، ۱ کیلوگرم ماهی قزل‌آلا، کره و ماست سنتی کوهپایه</p>
                        <div className="profile-sub-plan-price">
                          ۱,۴۵۰,۰۰۰ تومان <small>/ هر هفته</small>
                        </div>
                      </div>

                      <div
                        className={`profile-sub-plan-card ${selectedPlan === "family" ? "is-selected" : ""}`}
                        onClick={() => setSelectedPlan("family")}
                      >
                        <span className="profile-address-badge">محبوب‌ترین انتخاب</span>
                        <span className="crate-tag">سبد خانواده</span>
                        <h4>سبد خانواده سلامت (۴ تا ۵ نفره)</h4>
                        <p>شامل ۴ کیلوگرم انواع برش‌های گوسفندی و گوشت گرم، ۲ کیلوگرم ماهی، روغن حیوانی و پنیر ییلاقی</p>
                        <div className="profile-sub-plan-price">
                          ۲,۹۵۰,۰۰۰ تومان <small>/ هر هفته</small>
                        </div>
                      </div>

                      <div
                        className={`profile-sub-plan-card ${selectedPlan === "gourmet" ? "is-selected" : ""}`}
                        onClick={() => setSelectedPlan("gourmet")}
                      >
                        <span className="crate-tag">سبد گورمه</span>
                        <h4>سبد گورمه و سرآشپز ارگانیک</h4>
                        <p>برش‌های ویژه استیک دنده‌ای، راسته بدون چربی، عسل وحشی کوهستان و سبزیجات معطر</p>
                        <div className="profile-sub-plan-price">
                          ۴,۲۰۰,۰۰۰ تومان <small>/ هر هفته</small>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", paddingTop: "20px", borderTop: "1px solid rgba(0, 91, 72, 0.1)" }}>
                      <div>
                        <strong style={{ color: "#005b48", fontSize: "15px" }}>روز تحویل پیشنهادی: هر هفته دوشنبه‌ها (زنجیره سرد)</strong>
                        <span style={{ display: "block", fontSize: "12px", color: "#5d686e" }}>امکان تعلیق یا لغو بدون هزینه در هر زمان</span>
                      </div>
                      <button
                        type="button"
                        className="profile-btn-primary"
                        onClick={() => alert(`پلن ${selectedPlan} انتخاب شد. به زودی در منطقه شما فعال می‌گردد.`)}
                      >
                        تایید و شروع اشتراک با ۱۰٪ تخفیف
                      </button>
                    </div>
                  </div>
                </div>
              )}

                </motion.div>
              </AnimatePresence>
        </motion.div>
      </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="profile-loading-screen"><p>در حال بارگذاری…</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}
