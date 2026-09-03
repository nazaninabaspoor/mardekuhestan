"use client";

import React, { Suspense, useEffect, useLayoutEffect, useState, useRef, useCallback } from "react";
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
  if (password.length < 10) return "شل";
  if (password.length < 14) return "محکم";
  return "سفت";
}

function toMrz(text: string, length = 44) {
  const cleaned = text.replace(/@/g, "<").replace(/[^a-zA-Z0-9]+/g, "<").toUpperCase();
  return `${cleaned}${"<".repeat(length)}`.slice(0, length);
}

function passportNo(email: string) {
  const core = email.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7).padEnd(7, "X");
  return `MK${core}`;
}

function LedgerSecretField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="mk-safe-field">
      <label htmlFor={id}>{label}</label>
      <div className="mk-safe-secret">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
        <button
          type="button"
          className="mk-safe-peek"
          onClick={() => setVisible((open) => !open)}
          aria-label={visible ? "پنهان کردن رمز" : "نمایش رمز"}
        >
          {visible ? "پنهان" : "نمایش"}
        </button>
      </div>
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

function ProfileSceneBackdrop() {
  return (
    <div className="profile-scene-wallpaper" aria-hidden="true">
      <Image
        src="/brand/profile/profile-kitchen-dawn.png"
        alt=""
        fill
        sizes="100vw"
        quality={92}
        priority
        className="profile-scene-wallpaper-img"
      />
      <span className="profile-scene-vignette" />
      <span className="profile-scene-grain" />
    </div>
  );
}

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
      setFocusedTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const displayName = name.trim() || user?.name || "کاربر کوهستان";

  const handleFocusChange = useCallback(
    (tab: ActiveTab) => {
      setFocusedTab(tab);
      setOpenedTab(null);
      router.replace(`/profile?tab=${tab}`, { scroll: false });
    },
    [router]
  );

  const handleCardOpen = useCallback(
    (tab: ActiveTab) => {
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
      await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      setProfileSuccessMsg("روی شناسنامه نشست.");
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
        <ProfileSceneBackdrop />

        <div className="profile-scene-stage">
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
        </div>
      </section>

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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
              {openedTab !== "ai-nutrition" && openedTab !== "personal" && (
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
                    <header className="mk-ledger-topbar">
                      <div className="mk-ledger-brand">
                        <Image
                          src="/brand/orginal-clear.png"
                          alt="مرد کوهستان"
                          width={32}
                          height={32}
                          className="mk-ledger-logo"
                        />
                        <strong>امنیت و حساب</strong>
                        <span className="mk-ledger-live">احراز شده</span>
                      </div>
                      <button type="button" className="mk-ledger-close" onClick={handleCloseWorkspace}>
                        بستن
                      </button>
                    </header>

                  <div className="mk-ledger-scroll">
                    <div className="mk-ledger-desk">
                      <form className="mk-pass" onSubmit={handleProfileSubmit} aria-labelledby="pass-title">
                        <div className="mk-pass-spine" aria-hidden="true">
                          <span>PASSPORT</span>
                        </div>
                        <div className="mk-pass-page">
                          <svg className="mk-pass-watermark" viewBox="0 0 240 140" aria-hidden="true">
                            <polygon points="120,16 28,124 212,124" fill="none" stroke="#005b48" strokeWidth="1.1" />
                            <polygon points="120,40 58,124 182,124" fill="none" stroke="#005b48" strokeWidth="0.7" />
                            <circle cx="120" cy="78" r="34" fill="none" stroke="#d4a359" strokeWidth="0.5" />
                          </svg>
                          <span className="mk-pass-laminate" aria-hidden="true" />

                          <header className="mk-pass-head">
                            <span className="mk-pass-head-en">MARDE KOOHESTAN</span>
                            <Image
                              src="/brand/orginal-clear.png"
                              alt=""
                              width={44}
                              height={44}
                              className="mk-pass-crest"
                            />
                            <strong id="pass-title" className="mk-pass-head-fa">مرد کوهستان</strong>
                            <span className="mk-pass-head-doc">PASSPORT · گذرنامهٔ همسفر</span>
                          </header>

                          <p className="mk-pass-micro" aria-hidden="true">
                            این راه سبز است · THIS WAY IS GREEN · این راه سبز است · THIS WAY IS GREEN · این راه سبز است · THIS WAY IS GREEN
                          </p>

                          {profileSuccessMsg && (
                            <div className="mk-pass-alert is-ok" role="status">{profileSuccessMsg}</div>
                          )}
                          {profileErrorMsg && (
                            <div className="mk-pass-alert is-bad" role="alert">{profileErrorMsg}</div>
                          )}

                          <div className="mk-pass-codes">
                            <div>
                              <span>Type / نوع</span>
                              <b>P</b>
                            </div>
                            <div>
                              <span>Code / کد</span>
                              <b>MKN</b>
                            </div>
                            <div>
                              <span>No. / شماره</span>
                              <b dir="ltr">{passportNo(user.email)}</b>
                            </div>
                          </div>

                          <div className="mk-pass-viz">
                            <div className="mk-pass-photo-col">
                              <div className="mk-pass-photo">
                                <span className="mk-pass-foil" aria-hidden="true" />
                                <strong>{userInitial}</strong>
                                <small>همسفر</small>
                              </div>
                              <div className="mk-pass-ghost" aria-hidden="true">{userInitial}</div>
                            </div>

                            <div className="mk-pass-data">
                              <div className="mk-pass-row">
                                <label htmlFor="prof-name">
                                  <em>Name</em>
                                  نام
                                </label>
                                <input
                                  id="prof-name"
                                  type="text"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  placeholder="نام روی سند"
                                  autoComplete="name"
                                  required
                                />
                              </div>
                              <div className="mk-pass-row is-print">
                                <span>
                                  <em>Nationality</em>
                                  تابعیت
                                </span>
                                <b>همسفر راه سبز</b>
                              </div>
                              <div className="mk-pass-row">
                                <label htmlFor="prof-email">
                                  <em>Personal No. / ID</em>
                                  شناسه ورود
                                </label>
                                <input
                                  id="prof-email"
                                  type="email"
                                  dir="ltr"
                                  value={user.email}
                                  disabled
                                />
                              </div>
                              <div className="mk-pass-row">
                                <label htmlFor="prof-phone">
                                  <em>Tel</em>
                                  تلفن
                                </label>
                                <input
                                  id="prof-phone"
                                  type="tel"
                                  dir="ltr"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                                  autoComplete="tel"
                                />
                              </div>
                              <div className="mk-pass-pair">
                                <div className="mk-pass-row is-print">
                                  <span>
                                    <em>Authority</em>
                                    صادرکننده
                                  </span>
                                  <b>باشگاه راه سبز</b>
                                </div>
                                <div className="mk-pass-row is-print">
                                  <span>
                                    <em>Status</em>
                                    وضعیت
                                  </span>
                                  <b>احراز شده</b>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mk-pass-sign">
                            <span>
                              <em>Signature of holder</em>
                              امضای دارنده
                            </span>
                            <em className="mk-pass-sign-mark">{displayName}</em>
                          </div>

                          <div className="mk-pass-mrz" aria-hidden="true">
                            <span>{toMrz("P<MKNKOUHESTAN<<GREEN<WAY")}</span>
                            <span>{toMrz(`${passportNo(user.email)}<${user.email}`)}</span>
                          </div>

                          <button type="submit" disabled={isUpdatingProfile} className="mk-pass-save">
                            {isUpdatingProfile ? "ثبت…" : "مهر ثبت"}
                          </button>
                        </div>
                      </form>

                      <form className="mk-safe" onSubmit={handleChangePasswordSubmit} aria-labelledby="safe-title">
                        <span className="mk-safe-bolt is-tr" aria-hidden="true" />
                        <span className="mk-safe-bolt is-tl" aria-hidden="true" />
                        <span className="mk-safe-bolt is-br" aria-hidden="true" />
                        <span className="mk-safe-bolt is-bl" aria-hidden="true" />

                        <header className="mk-safe-head">
                          <div>
                            <span className="mk-safe-kicker">VAULT</span>
                            <h3 id="safe-title">گاوصندوق</h3>
                          </div>
                          <div className="mk-safe-dial" aria-hidden="true">
                            <span className="mk-safe-dial-ring" />
                            <span className="mk-safe-dial-ring is-mid" />
                            <span className="mk-safe-dial-core" />
                          </div>
                        </header>

                        <div className="mk-safe-cavity">
                            {passSuccessMsg && (
                              <div className="mk-safe-alert is-ok" role="status">{passSuccessMsg}</div>
                            )}
                            {passErrorMsg && (
                              <div className="mk-safe-alert is-bad" role="alert">{passErrorMsg}</div>
                            )}

                            <p className="mk-safe-group">کلید فعلی</p>
                            <LedgerSecretField
                              id="prof-cur-pass"
                              label="رمز فعلی"
                              value={currentPassword}
                              onChange={setCurrentPassword}
                              placeholder="••••••••"
                              autoComplete="current-password"
                              required
                            />

                            <p className="mk-safe-group">ترکیب تازه</p>
                            <LedgerSecretField
                              id="prof-new-pass"
                              label="رمز تازه"
                              value={newPassword}
                              onChange={setNewPassword}
                              placeholder="حداقل ۱۰ نویسه"
                              autoComplete="new-password"
                              required
                            />
                            {newPassword ? (
                              <p className={`mk-safe-tight${newPassword.length < 10 ? " is-loose" : ""}`}>
                                {folioLockWord(newPassword)}
                              </p>
                            ) : null}
                            <LedgerSecretField
                              id="prof-new-pass-rep"
                              label="تکرار"
                              value={newPasswordRepeat}
                              onChange={setNewPasswordRepeat}
                              placeholder="تکرار رمز تازه"
                              autoComplete="new-password"
                              required
                            />

                            <button type="submit" disabled={isChangingPass} className="mk-safe-turn">
                              {isChangingPass ? "در حال قفل…" : "قفل تازه"}
                            </button>
                        </div>
                      </form>
                    </div>

                    <section className="mk-street" aria-labelledby="folio-mail-title">
                      <div className="mk-street-head">
                        <span>پاکت‌های تحویل</span>
                        <h3 id="folio-mail-title">زنجیره سرد روی این خیابان می‌رسد.</h3>
                      </div>

                      <div className="mk-street-view">
                        <Image
                          src="/brand/profile/personal-delivery-street.png"
                          alt="خیابان واقعی روستا: خانه، دفتر و در باغ"
                          fill
                          sizes="100vw"
                          quality={92}
                          className="mk-street-img"
                        />

                        <article className="mk-street-spot is-home">
                          <span className="mk-street-tag">منزل</span>
                          <h4>تهران، زعفرانیه</h4>
                          <p>خیابان آصف، خیابان کمالی، کوچه بنفشه، پلاک ۱۲، واحد ۳</p>
                          <small>{displayName}</small>
                        </article>

                        <article className="mk-street-spot is-office">
                          <span className="mk-street-tag is-work">دفتر</span>
                          <h4>تهران، فرمانیه</h4>
                          <p>بلوار اندرزگو، خیابان سلیمی شمالی، ساختمان اداری نگین، طبقه ۴</p>
                          <small>{displayName}</small>
                        </article>

                        <button
                          type="button"
                          className="mk-street-spot is-add"
                          onClick={() => alert("فرم افزودن نشانی جدید به زودی فعال می‌شود.")}
                        >
                          <span className="mk-street-tag">در باغ</span>
                          <strong>نشانی تازه</strong>
                          <p>قطعهٔ خالی کنار در باغ.</p>
                        </button>
                      </div>
                    </section>
                  </div>
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

              {/* Tab 5: Orders & Farm Traceability */}
                  {openedTab === "orders" && (
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
                              <p className="passport-origin">مُهر مرتع · گله آزاد</p>
                            </div>
                          </div>
                          <div className="profile-order-product-card">
                            <Image src="/brand/home-dairy.png" alt="کره سنتی کوهپایه" width={48} height={48} />
                            <div>
                              <strong>کره سنتی خالص کوهپایه (۵۰۰ گرم)</strong>
                              <span>شناسنامه: دامداری سنتی هزارجریب</span>
                              <p className="passport-origin">زنجیره سرد ثبت‌شده</p>
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
        )}
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
