"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { authErrorMessage, changePassword } from "@/lib/api/auth";

type ActiveTab = "personal" | "ai-nutrition" | "wallet" | "orders";

// Pre-defined suggestions for the AI Nutrition Assistant
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

function ProfileContent() {
  const { user, isLoading, openLoginModal, updateUserProfile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = (searchParams.get("tab") as ActiveTab) || "personal";
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");

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

  // Wallet & Subscription State
  const [walletBalance, setWalletBalance] = useState(50000);
  const [greenPoints, setGreenPoints] = useState(120);
  const [chargeAmount, setChargeAmount] = useState("100000");
  const [walletMsg, setWalletMsg] = useState<string | null>(null);

  useEffect(() => {
    if (tabParam && ["personal", "ai-nutrition", "wallet", "orders"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`);
  };

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
        {/* Pinterest-style Scenic Hero Card */}
        <div className="profile-scenic-card">
          <div className="profile-scenic-bg-wrap">
            <Image
              src="/brand/profile-club-banner.png"
              alt="باشگاه راه سبز مرد کوهستان"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="profile-scenic-img"
            />
            <div className="profile-scenic-overlay" />
          </div>

          <div className="profile-scenic-inner">
            <div className="profile-hero-user-cluster">
              <div className="profile-avatar-super-wrap">
                <div className="profile-avatar-luxury">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="profile-avatar-glow" aria-hidden="true" />
              </div>

              <div className="profile-hero-user-text">
                <div className="profile-hero-title-line">
                  <h1>{displayName}</h1>
                  <span className="profile-luxury-badge">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
                    </svg>
                    همسفر باشگاه راه سبز
                  </span>
                </div>
                <div className="profile-hero-email-line">
                  <span>{user.email}</span>
                  <span className="profile-verified-dot">احراز هویت شده</span>
                </div>
              </div>
            </div>

            <div className="profile-metrics-deck">
              <div className="profile-metric-chip">
                <div className="profile-metric-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div className="profile-metric-data">
                  <span className="profile-metric-lbl">اعتبار سبز کیف پول</span>
                  <strong className="profile-metric-num">
                    {walletBalance.toLocaleString("fa-IR")} <small>تومان</small>
                  </strong>
                </div>
              </div>

              <div className="profile-metric-chip">
                <div className="profile-metric-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="profile-metric-data">
                  <span className="profile-metric-lbl">امتیاز کوهستان</span>
                  <strong className="profile-metric-num">
                    {greenPoints.toLocaleString("fa-IR")} <small>امتیاز</small>
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Minimal Tabs Deck */}
        <div className="profile-tabs-deck" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "personal"}
            className={`profile-tab-btn ${activeTab === "personal" ? "is-active" : ""}`}
            onClick={() => handleTabChange("personal")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>اطلاعات فردی و امنیت</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ai-nutrition"}
            className={`profile-tab-btn profile-tab-btn--sparkle ${activeTab === "ai-nutrition" ? "is-active" : ""}`}
            onClick={() => handleTabChange("ai-nutrition")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
            </svg>
            <span>دستیار هوش مصنوعی تغذیه</span>
            <span className="profile-tag-pill">ویژه</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "wallet"}
            className={`profile-tab-btn ${activeTab === "wallet" ? "is-active" : ""}`}
            onClick={() => handleTabChange("wallet")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span>کیف پول و امتیاز سبز</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "orders"}
            className={`profile-tab-btn ${activeTab === "orders" ? "is-active" : ""}`}
            onClick={() => handleTabChange("orders")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="m7.5 4.27 9 5.15" />
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5" />
              <path d="M12 22V12" />
            </svg>
            <span>سفارش‌ها و شناسنامه مرتع</span>
          </button>
        </div>

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
                    <label htmlFor="pass-curr">رمز عبور فعلی</label>
                    <input
                      id="pass-curr"
                      type="password"
                      dir="ltr"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="pass-new">رمز عبور جدید</label>
                    <input
                      id="pass-new"
                      type="password"
                      dir="ltr"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="حداقل ۱۰ نویسه"
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="pass-repeat">تکرار رمز عبور جدید</label>
                    <input
                      id="pass-repeat"
                      type="password"
                      dir="ltr"
                      value={newPasswordRepeat}
                      onChange={(e) => setNewPasswordRepeat(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="profile-btn-secondary"
                  >
                    {isChangingPass ? "در حال به‌روزرسانی…" : "تغییر رمز عبور"}
                  </button>
                </form>
              </div>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="profile-card profile-card--full">
              <div className="profile-card-header">
                <h3>آدرس‌های تحویل سبد تازه</h3>
                <p>محل تحویل سفارش‌های مستقیم از مزرعه و مرتع مرد کوهستان.</p>
              </div>
              <div className="profile-addresses-list">
                <div className="profile-address-box is-default">
                  <div className="profile-address-badge">آدرس پیش‌فرض</div>
                  <h4>تهران، منطقه ۱</h4>
                  <p>خیابان پاسداران، بوستان ششم، پلاک ۱۲، واحد ۴</p>
                  <span className="profile-address-phone">گیرنده: {displayName} — {user.phone || "۰۹۱۲۳۴۵۶۷۸۹"}</span>
                </div>
                <div className="profile-address-box profile-address-box--add">
                  <button type="button" className="profile-btn-add-addr">
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    <span>افزودن آدرس جدید</span>
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
              <div className="profile-ai-hero-content">
                <div className="profile-ai-badge">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" /></svg>
                  هوش مصنوعی راهیار سلامت و تغذیه کوهستان
                </div>
                <h2>مشاور هوشمند رژیم ارگانیک، ارزش غذایی و دستور پخت اصیل</h2>
                <p>
                  پاسخگویی آنی بر اساس داده‌های تغذیه‌ای علمی، نوع پرورش طبیعی دام در مراتع ییلاقی، پروتئین خالص و سالم‌ترین روش‌های طبخ سفره ایرانی.
                </p>
              </div>

              {/* Quick Prompts */}
              <div className="profile-ai-prompts-grid">
                {AI_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="profile-ai-prompt-btn"
                    onClick={() => handleSendAiMessage(prompt)}
                  >
                    <span className="profile-ai-prompt-icon">💡</span>
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Chat Window */}
            <div className="profile-ai-chatbox">
              <div className="profile-ai-chat-header">
                <div className="profile-ai-assistant-avatar">
                  <Image src="/brand/orginal-clear.png" alt="مرد کوهستان" width={32} height={32} />
                </div>
                <div>
                  <strong>دستیار تغذیه مرد کوهستان</strong>
                  <span className="profile-ai-online-status">
                    <span className="profile-status-dot" /> آماده پاسخگویی هوشمند
                  </span>
                </div>
              </div>

              <div className="profile-ai-messages-area">
                {aiMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`profile-ai-msg ${msg.sender === "user" ? "is-user" : "is-assistant"}`}
                  >
                    <div className="profile-ai-msg-bubble">
                      <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
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

            {/* Weekly Fresh Subscription Box */}
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
                    onClick={() => alert("سرویس اشتراک هفتگی به زودی برای منطقه شما فعال می‌گردد.")}
                  >
                    تنظیم و فعال‌سازی سبد هفتگی
                  </button>
                </div>
                <div className="profile-sub-image-wrap">
                  <Image
                    src="/brand/home-meat.png"
                    alt="سبد تازه مرد کوهستان"
                    width={220}
                    height={220}
                    className="profile-sub-img"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Orders & Farm Traceability */}
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
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" /></svg>
                      دمای حمل زنجیره سرد: ۲.۴ درجه سانتی‌گراد (کنترل شده)
                    </div>
                    <strong className="profile-order-total">مبلغ کل: ۷۸۰,۰۰۰ تومان</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
