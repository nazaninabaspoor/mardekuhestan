"use client";

import React, { Suspense, useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { authErrorMessage, changePassword } from "@/lib/api/auth";

type ActiveTab = "personal" | "ai-nutrition" | "wallet" | "subscription" | "orders";

interface CoverflowItem {
  id: ActiveTab;
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon: string;
  image: string;
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
    image: "/brand/profile/card-profile-security.png",
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
    image: "/brand/profile/card-profile-ai.png",
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
    image: "/brand/profile/card-profile-wallet.png",
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
    image: "/brand/profile/card-profile-subscription.png",
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
    image: "/brand/profile/card-profile-orders.png",
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
    text: "درود بر شما همسفر گرامی مرد کوهستان! 🏔️ من دستیار هوشمند سلامت، تغذیه و طبخ ارگانیک مرد کوهستان هستم. چطور می‌توانم در انتخاب بهترین مواد غذایی سالم، برنامه‌ریزی رژیم روزانه یا نحوه طبخ اصیل به شما کمک کنم؟",
    time: "همین حالا",
  },
];

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

  // 3D Motion Physics & Positions
  const translateX = offset * 230;
  const translateZ = isActive ? 140 : isAdjacent ? -40 : -180;
  const rotateY = offset * -32;
  const scale = isActive ? 1.08 : isAdjacent ? 0.9 : 0.76;
  const opacity = isActive ? 1 : isAdjacent ? 0.8 : 0.35;
  const zIndex = 30 - Math.abs(offset) * 10;

  // Interactive 3D tilt for active card
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const tiltRotateX = useTransform(cardY, [-150, 150], [8, -8]);
  const tiltRotateY = useTransform(cardX, [-150, 150], [-8, 8]);

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
      className={`coverflow-card ${isActive ? "is-active" : ""}`}
      style={{
        zIndex,
        rotateX: isActive ? tiltRotateX : 0,
      }}
      animate={{
        x: translateX,
        z: translateZ,
        rotateY: rotateY,
        scale: scale,
        opacity: opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 26,
        mass: 0.9,
      }}
      whileHover={
        isActive
          ? { scale: 1.11, transition: { duration: 0.25 } }
          : { opacity: 0.95, scale: scale * 1.04, transition: { duration: 0.25 } }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
    >
      <div className="coverflow-card-bg-wrap">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 260px, 340px"
          className="coverflow-card-img"
          priority={isActive || isAdjacent}
        />
        <div className="coverflow-card-overlay" />
      </div>

      <div className="coverflow-card-content">
        <div className="coverflow-card-top">
          <span className="coverflow-card-badge">
            <span>{item.badgeIcon}</span>
            <span>{item.badge}</span>
          </span>
          <span className="profile-bar-stat-lbl">{item.statsText}</span>
        </div>

        <div className="coverflow-card-bottom">
          <h3 className="coverflow-card-title">{item.title}</h3>
          <p className="coverflow-card-subtitle">{item.subtitle}</p>
          <div className="coverflow-card-action">
            <span>{item.actionText}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileContent() {
  const { user, isLoading, openLoginModal, updateUserProfile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get("tab") as ActiveTab) || "personal";
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Edit profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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

  // Subscription plan selection
  const [selectedPlan, setSelectedPlan] = useState<"standard" | "family" | "gourmet">("family");

  useEffect(() => {
    if (tabParam && ["personal", "ai-nutrition", "wallet", "subscription", "orders"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleTabChange = useCallback(
    (tab: ActiveTab, shouldScroll = false) => {
      setActiveTab(tab);
      router.replace(`/profile?tab=${tab}`, { scroll: false });
      if (shouldScroll && workspaceRef.current) {
        workspaceRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [router]
  );

  const currentIdx = COVERFLOW_ITEMS.findIndex((item) => item.id === activeTab);
  const selectedIndex = currentIdx >= 0 ? currentIdx : 0;

  const handlePrevCard = () => {
    const nextIdx = (selectedIndex - 1 + COVERFLOW_ITEMS.length) % COVERFLOW_ITEMS.length;
    handleTabChange(COVERFLOW_ITEMS[nextIdx].id);
  };

  const handleNextCard = () => {
    const nextIdx = (selectedIndex + 1) % COVERFLOW_ITEMS.length;
    handleTabChange(COVERFLOW_ITEMS[nextIdx].id);
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
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      setProfileSuccessMsg("اطلاعات فردی شما با موفقیت ذخیره و به‌روز شد.");
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
      setPassErrorMsg("رمز عبور جدید باید حداقل ۱۰ نویسه باشد.");
      return;
    }
    if (newPassword !== newPasswordRepeat) {
      setPassErrorMsg("دو رمز عبور جدید وارد شده یکسان نیستند.");
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
        newPasswordRepeat,
      });
      setPassSuccessMsg("رمز عبور شما با موفقیت تغییر کرد.");
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
        reply = "🥩 برای گوشت راسته گوسفندی مرتع مرد کوهستان:\n\n۱. به دلیل تغذیه طبیعی دام در ارتفاعات البرز و بافت بسیار لطیف، نیازی به مرینیت طولانی با اسیدهای تند ندارید.\n۲. فقط با کمی روغن زیتون فرابکر، رزماری کوهی و فلفل سیاه نیم‌کوب آغشته کنید.\n۳. در تابه چدنی بسیار داغ هر طرف را ۳ تا ۴ دقیقه تفت دهید تا آبدار بماند.\n۴. قبل از برش، ۳ دقیقه استراحت دهید تا میوگلوبین و ارزش پروتئینی آن در بافت حفظ شود.";
      } else if (lower.includes("برنامه") || lower.includes("رژیم") || lower.includes("پروتئین")) {
        reply = "📋 برنامه ۳ روزه پروتئین سالم با محصولات سبز مرد کوهستان:\n\n• روز اول: فیله مرغ بدون آنتی‌بیوتیک + خوراک سبزیجات معطر مزرعه + روغن زیتون طبیعی\n• روز دوم: ماهی قزل‌آلای آب سرد کبابی + دوغ سنتی و پروبیوتیک کوهپایه\n• روز سوم: فیله گوسفند مرتعی با پوره سیب‌زمینی تنوری و سبزیجات خشک کوهستان\n\n💡 این ترکیب روزانه به طور میانگین ۱۱۰ گرم پروتئین خالص بدون چربی مضر تامین می‌کند.";
      } else if (lower.includes("ماهی") || lower.includes("دریایی") || lower.includes("قزل")) {
        reply = "🐟 ماهی قزل‌آلای مرد کوهستان در جریان آب خنک و پر از اکسیژن چشمه‌های طبیعی رشد می‌کند. به همین خاطر:\n• بافت آن بدون بو و کاملاً منسجم و صورتی است.\n• سرشار از اسیدهای چرب امگا ۳ فعال و فسفر طبیعی است.\n• در مقایسه با استخرهای متراکم، میزان پروتئین خالص آن ۲۵٪ بیشتر و فاقد هرگونه چربی سنگین است.";
      } else if (lower.includes("کره") || lower.includes("روغن") || lower.includes("کتو")) {
        reply = "🧈 روغن حیوانی و کره سنتی مرد کوهستان از شیر دوشیده‌شده در مراتع ییلاقی تولید می‌شود. این محصولات حاوی CLA (اسید لینولئیک کونژوگه) و ویتامین‌های محلول در چربی (A, D, K2) هستند که در رژیم کتوژنیک به عنوان سوخت پاک برای سلول‌ها و افزایش انرژی پایدار روزانه عمل می‌کنند.";
      } else {
        reply = `✨ پیشنهاد تغذیه هوشمند بر اساس سفره سبز مرد کوهستان:\n\nغذای طبیعی سلامت تن و آرامش روان را می‌سازد. محصولات مرد کوهستان از منبع مرتع و مزرعه بدون هیچ‌گونه ماده نگه‌دارنده به دست شما می‌رسد. شما می‌توانید محصولات پروتئینی، لبنی و ارگانیک را مستقیماً از بخش «محصولات» سفارش داده و ارزش غذایی دقیق هر کدام را در شناسنامه مزرعه مشاهده نمایید.`;
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
      <div className="profile-loading-screen">
        <div className="profile-loading-spinner" />
        <p>در حال فراخوانی اطلاعات همسفر سبز…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-guest-card shell">
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
    );
  }

  const displayName = user.name || user.email.split("@")[0] || "همسفر گرامی";

  return (
    <div className="profile-page-wrapper">
      <div className="shell">
        {/* Floating Atmospheric Top Navigation Bar */}
        <motion.div
          className="profile-top-bar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="profile-bar-user">
            <div className="profile-bar-avatar">
              {displayName.charAt(0).toUpperCase()}
              <span className="profile-bar-avatar-badge" title="احراز هویت شده" />
            </div>
            <div className="profile-bar-info">
              <h1>
                {displayName}
                <span className="profile-bar-vip">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
                  </svg>
                  همسفر باشگاه راه سبز
                </span>
              </h1>
              <p className="profile-bar-email">{user.email}</p>
            </div>
          </div>

          <div className="profile-bar-stats">
            <div className="profile-bar-stat-pill">
              <span className="profile-bar-stat-lbl">اعتبار کیف پول:</span>
              <strong className="profile-bar-stat-val">{walletBalance.toLocaleString("fa-IR")} تومان</strong>
            </div>
            <div className="profile-bar-stat-pill">
              <span className="profile-bar-stat-lbl">امتیاز سبز:</span>
              <strong className="profile-bar-stat-val">{greenPoints} امتیاز</strong>
            </div>
          </div>
        </motion.div>

        {/* 3D Cinematic Perspective Coverflow Section */}
        <div className="profile-coverflow-section">
          <div className="profile-coverflow-header">
            <span className="profile-coverflow-kicker">Marde Koohestan • Member Club Experience</span>
            <h2 className="profile-coverflow-title">میز کاربری و خدمات اختصاصی کوهستان</h2>
            <p className="profile-coverflow-sub">روی کارت‌ها کلیک کنید، با فلش‌ها جابجا شوید یا کارت‌ها را با ماوس/لمس بکشید</p>
          </div>

          <div className="profile-coverflow-stage">
            {/* Prev Navigation Arrow */}
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

            {/* 3D Perspective Card Deck with Touch & Gesture Handling */}
            <motion.div
              className="profile-coverflow-track"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
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
                  onSelect={() => handleTabChange(item.id, true)}
                />
              ))}
            </motion.div>

            {/* Next Navigation Arrow */}
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

          {/* Indicator Pills with Smooth Animated Active Capsule */}
          <div className="coverflow-indicators" role="tablist">
            {COVERFLOW_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`coverflow-indicator-btn ${isActive ? "is-active" : ""}`}
                  onClick={() => handleTabChange(item.id, false)}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCoverflowPill"
                      className="coverflow-active-pill"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="coverflow-indicator-dot" />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab Interactive Workspace */}
        <motion.div
          className="profile-workspace-section"
          ref={workspaceRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="profile-workspace-header">
            <div className="profile-workspace-title-wrap">
              <h2>
                <span>{COVERFLOW_ITEMS[selectedIndex]?.badgeIcon}</span>
                <span>{COVERFLOW_ITEMS[selectedIndex]?.title}</span>
              </h2>
              <p>{COVERFLOW_ITEMS[selectedIndex]?.subtitle}</p>
            </div>
            <span className="profile-workspace-badge">
              {COVERFLOW_ITEMS[selectedIndex]?.badge}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 18, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Tab 1: Personal Info & Security */}
              {activeTab === "personal" && (
                <div className="profile-tab-pane">
                  <div className="profile-grid-deck">
                    {/* Profile Details Form */}
                    <div className="profile-card">
                      <div className="profile-card-header">
                        <h3>مشخصات فردی و تماس</h3>
                        <p>اطلاعاتی که برای ارسال سفارش و شناسنامه مشتری استفاده می‌شود.</p>
                      </div>

                      {profileSuccessMsg && (
                        <div className="profile-alert profile-alert--success">
                          <span>{profileSuccessMsg}</span>
                        </div>
                      )}
                      {profileErrorMsg && (
                        <div className="profile-alert profile-alert--error">
                          <span>{profileErrorMsg}</span>
                        </div>
                      )}

                      <form onSubmit={handleProfileSubmit} className="profile-form">
                        <div className="profile-field">
                          <label htmlFor="prof-name">نام و نام خانوادگی</label>
                          <input
                            id="prof-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="مثال: کامران کوهستانی"
                            required
                          />
                        </div>

                        <div className="profile-field">
                          <label htmlFor="prof-email">ایمیل (شناسه ورود)</label>
                          <input
                            id="prof-email"
                            type="email"
                            dir="ltr"
                            value={user.email}
                            disabled
                            className="is-disabled"
                          />
                          <small className="profile-field-hint">ایمیل قابل تغییر نیست و به عنوان شناسه امنیتی یکتا ثبت شده است.</small>
                        </div>

                        <div className="profile-field">
                          <label htmlFor="prof-phone">شماره موبایل</label>
                          <input
                            id="prof-phone"
                            type="tel"
                            dir="ltr"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isUpdatingProfile}
                          className="profile-btn-primary"
                        >
                          {isUpdatingProfile ? "در حال ذخیره…" : "ذخیره تغییرات مشخصات"}
                        </button>
                      </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="profile-card">
                      <div className="profile-card-header">
                        <h3>تغییر رمز عبور</h3>
                        <p>برای حفظ امنیت حساب، رمز عبور قوی با حداقل ۱۰ کاراکتر انتخاب کنید.</p>
                      </div>

                      {passSuccessMsg && (
                        <div className="profile-alert profile-alert--success">
                          <span>{passSuccessMsg}</span>
                        </div>
                      )}
                      {passErrorMsg && (
                        <div className="profile-alert profile-alert--error">
                          <span>{passErrorMsg}</span>
                        </div>
                      )}

                      <form onSubmit={handleChangePasswordSubmit} className="profile-form">
                        <div className="profile-field">
                          <label htmlFor="prof-cur-pass">رمز عبور فعلی</label>
                          <input
                            id="prof-cur-pass"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <div className="profile-field">
                          <label htmlFor="prof-new-pass">رمز عبور جدید</label>
                          <input
                            id="prof-new-pass"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="حداقل ۱۰ کاراکتر"
                            required
                          />
                        </div>

                        <div className="profile-field">
                          <label htmlFor="prof-new-pass-rep">تکرار رمز عبور جدید</label>
                          <input
                            id="prof-new-pass-rep"
                            type="password"
                            value={newPasswordRepeat}
                            onChange={(e) => setNewPasswordRepeat(e.target.value)}
                            placeholder="تکرار رمز عبور جدید"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isChangingPass}
                          className="profile-btn-secondary"
                        >
                          {isChangingPass ? "در حال تغییر رمز…" : "تغییر کلمه عبور"}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Delivery Addresses */}
                  <div className="profile-card profile-card--full">
                    <div className="profile-card-header">
                      <h3>نشانی‌های تحویل سفارش (زنجیره سرد)</h3>
                      <p>آدرس‌های منتخب شما برای ارسال اکسپرس در دمای کنترل‌شده یخچال.</p>
                    </div>

                    <div className="profile-addresses-list">
                      <div className="profile-address-box is-default">
                        <span className="profile-address-badge">نشانی اصلی منزل</span>
                        <h4>تهران، زعفرانیه</h4>
                        <p>خیابان آصف، خیابان کمالی، کوچه بنفشه، پلاک ۱۲، واحد ۳</p>
                        <span className="profile-address-phone">تحویل‌گیرنده: {displayName} (۰۹۱۲۱۲۳۴۵۶۷)</span>
                      </div>

                      <div className="profile-address-box">
                        <span className="profile-address-badge" style={{ background: "#903828" }}>دفتر کار</span>
                        <h4>تهران، فرمانیه</h4>
                        <p>بلوار اندرزگو، خیابان سلیمی شمالی، ساختمان اداری نگین، طبقه ۴</p>
                        <span className="profile-address-phone">تحویل‌گیرنده: {displayName}</span>
                      </div>

                      <div className="profile-address-box profile-address-box--add">
                        <button type="button" className="profile-btn-add-addr" onClick={() => alert("فرم افزودن نشانی جدید به زودی فعال می‌شود.")}>
                          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          افزودن نشانی جدید
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: AI Mountain Nutrition Assistant */}
              {activeTab === "ai-nutrition" && (
                <div className="profile-tab-pane">
                  <div className="profile-ai-hero">
                    <h2>مشاور هوشمند رژیم غذایی و آشپزی ارگانیک مرد کوهستان</h2>
                    <p>
                      پاسخگویی آنی درباره نحوه طبخ اصیل گوشت مرتع، ارزش غذایی ماهی آب سرد، خواص روغن حیوانی سنتی و پیشنهاد برنامه‌های غذایی هفتگی.
                    </p>

                    <div className="profile-ai-prompts-grid">
                      {AI_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="profile-ai-prompt-btn"
                          onClick={() => handleSendAiMessage(prompt)}
                        >
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="profile-ai-chatbox">
                    <div className="profile-ai-chat-header">
                      <Image
                        src="/brand/orginal-clear.png"
                        alt="مرد کوهستان"
                        width={36}
                        height={36}
                        className="profile-ai-assistant-avatar"
                      />
                      <div>
                        <strong>دستیار تغذیه و سلامت مرد کوهستان</strong>
                        <span className="profile-ai-online-status">آنلاین • متصل به پایگاه داده تغذیه مرتع</span>
                      </div>
                    </div>

                    <div className="profile-ai-messages-area">
                      {aiMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`profile-ai-msg ${msg.sender === "user" ? "is-user" : "is-assistant"}`}
                        >
                          <div className="profile-ai-msg-bubble">
                            <p>{msg.text}</p>
                            <span className="profile-ai-msg-time">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                      {aiTyping && (
                        <div className="profile-ai-msg is-assistant">
                          <div className="profile-ai-msg-bubble profile-ai-typing">
                            <span />
                            <span />
                            <span />
                          </div>
                        </div>
                      )}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendAiMessage();
                      }}
                      className="profile-ai-input-bar"
                    >
                      <input
                        type="text"
                        placeholder="از دستیار هوش مصنوعی درباره خواص گوشت مرتع، ماهی تازه، رژیم غذایی یا روش طبخ بپرسید…"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={aiTyping || !aiInput.trim()}
                        className="profile-ai-send-btn"
                        aria-label="ارسال پیام"
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 3: Green Way Wallet & Loyalty */}
              {activeTab === "wallet" && (
                <div className="profile-tab-pane">
                  <div className="profile-grid-deck">
                    {/* Wallet Balance & Recharge */}
                    <div className="profile-card">
                      <div className="profile-card-header">
                        <h3>کیف پول و اعتبار سبز</h3>
                        <p>اعتبار نقدی برای خرید بی‌واسطه و سریع با تخفیف‌های ویژه همسفران.</p>
                      </div>

                      <div className="profile-wallet-balance-banner">
                        <span className="profile-wallet-kicker">موجودی در دسترس</span>
                        <strong className="profile-wallet-big-val">{walletBalance.toLocaleString("fa-IR")} <span>تومان</span></strong>
                        <span className="profile-wallet-gift-note">شامل ۵۰,۰۰۰ تومان هدیه عضویت باشگاه راه سبز</span>
                      </div>

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

                      <div className="profile-points-box">
                        <div className="profile-points-icon">🌱</div>
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
                          onClick={() => handleTabChange("subscription", true)}
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
              {activeTab === "subscription" && (
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

              {/* Tab 5: Orders & Farm Traceability */}
              {activeTab === "orders" && (
                <div className="profile-tab-pane">
                  <div className="profile-card profile-card--full">
                    <div className="profile-card-header">
                      <h3>تاریخچه سفارش‌ها و شناسنامه مرتع</h3>
                      <p>ردیابی دقیق و شفاف از لحظه آماده‌سازی در مزرعه تا تحویل به خانه با زنجیره سرد.</p>
                    </div>

                    <div className="profile-orders-list">
                      <div className="profile-order-item">
                        <div className="profile-order-top">
                          <div>
                            <span className="profile-order-id">سفارش #MK-94021</span>
                            <span className="profile-order-date">دوشنبه ۱۰ شهریور ۱۴۰۵</span>
                          </div>
                          <span className="profile-order-badge is-delivered">تحویل شده با زنجیره سرد</span>
                        </div>

                        <div className="profile-order-items-grid">
                          <div className="profile-order-product-card">
                            <Image src="/brand/home-meat.png" alt="راسته بره مرتعی" width={48} height={48} />
                            <div>
                              <strong>راسته بره مرتعی تازه (۱ کیلوگرم)</strong>
                              <span>شناسنامه: مرتع ییلاقی کلاردشت (ارتفاع ۲,۲۰۰ متر)</span>
                            </div>
                          </div>
                          <div className="profile-order-product-card">
                            <Image src="/brand/home-dairy.png" alt="کره سنتی کوهپایه" width={48} height={48} />
                            <div>
                              <strong>کره سنتی خالص کوهپایه (۵۰۰ گرم)</strong>
                              <span>شناسنامه: دامداری سنتی هزارجریب</span>
                            </div>
                          </div>
                        </div>

                        <div className="profile-order-footer">
                          <div className="profile-order-passport-tag">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
                            </svg>
                            دمای حمل زنجیره سرد: ۲.۴ درجه سانتی‌گراد (کنترل شده)
                          </div>
                          <strong className="profile-order-total">مبلغ کل: ۷۸۰,۰۰۰ تومان</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
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
