"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { authErrorMessage } from "@/lib/api/auth";

export function AuthModal() {
  const {
    isModalOpen,
    modalTab,
    closeAuthModal,
    setModalTab,
    login,
    register,
  } = useAuth();

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form states
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordRepeat, setRegPasswordRepeat] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset errors when tab or open state changes
  useEffect(() => {
    setError(null);
  }, [modalTab, isModalOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, closeAuthModal]);

  if (!isModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginEmail.trim()) {
      setError("لطفاً ایمیل خود را وارد کنید.");
      return;
    }
    if (!loginPassword) {
      setError("لطفاً رمز عبور خود را وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim()) {
      setError("لطفاً نام و نام خانوادگی خود را بنویسید.");
      return;
    }
    if (!regEmail.trim()) {
      setError("لطفاً ایمیل خود را بنویسید.");
      return;
    }
    if (!regPassword) {
      setError("لطفاً رمز عبور را بنویسید.");
      return;
    }
    if (regPassword.length < 10) {
      setError("رمز عبور باید حداقل ۱۰ حرف باشد.");
      return;
    }
    if (regPassword !== regPasswordRepeat) {
      setError("دو رمز عبور وارد شده یکسان نیستند.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        passwordRepeat: regPasswordRepeat,
      });
      setRegName("");
      setRegEmail("");
      setRegPhone("");
      setRegPassword("");
      setRegPasswordRepeat("");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="auth-modal-card">
        {/* Header with close button & Brand identity */}
        <div className="auth-modal-header">
          <div className="auth-modal-brand">
            <Image
              src="/brand/orginal-clear.png"
              alt="مرد کوهستان"
              width={44}
              height={44}
              className="auth-modal-logo"
            />
            <div>
              <h2 className="auth-modal-title">
                {modalTab === "login" ? "ورود به حساب کاربری" : "عضویت در خانواده مرد کوهستان"}
              </h2>
              <p className="auth-modal-subtitle">این راه سبز است</p>
            </div>
          </div>
          <button
            type="button"
            className="auth-modal-close"
            onClick={closeAuthModal}
            aria-label="بستن پنجره"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab switchers */}
        <div className="auth-modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={modalTab === "login"}
            className={`auth-tab-btn ${modalTab === "login" ? "is-active" : ""}`}
            onClick={() => setModalTab("login")}
          >
            ورود به حساب
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modalTab === "register"}
            className={`auth-tab-btn ${modalTab === "register" ? "is-active" : ""}`}
            onClick={() => setModalTab("register")}
          >
            ثبت‌نام جدید
          </button>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="auth-error-banner" role="alert">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {modalTab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="auth-login-email">ایمیل</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-login-email"
                  type="email"
                  dir="ltr"
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoFocus
                />
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-login-pass">رمز عبور</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-login-pass"
                  type={showLoginPassword ? "text" : "password"}
                  dir="ltr"
                  placeholder="••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowLoginPassword((s) => !s)}
                  aria-label={showLoginPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                >
                  {showLoginPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? "در حال ورود..." : "ورود به حساب کاربری"}
            </button>

            <div className="auth-footer-prompt">
              <span>حساب کاربری ندارید؟</span>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => setModalTab("register")}
              >
                ثبت‌نام و ایجاد حساب
              </button>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="auth-reg-name">نام و نام خانوادگی</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-reg-name"
                  type="text"
                  placeholder="مثال: علی رضایی"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  autoFocus
                />
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-reg-email">ایمیل</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-reg-email"
                  type="email"
                  dir="ltr"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-reg-phone">شماره موبایل (اختیاری)</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-reg-phone"
                  type="tel"
                  dir="ltr"
                  placeholder="۰۹۱۲۱۲۳۴۵۶۷"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
                <span className="auth-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-reg-pass">رمز عبور (حداقل ۱۰ نویسه)</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-reg-pass"
                  type={showRegPassword ? "text" : "password"}
                  dir="ltr"
                  placeholder="••••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-pass-toggle"
                  onClick={() => setShowRegPassword((s) => !s)}
                  aria-label={showRegPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                >
                  {showRegPassword ? (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="auth-reg-pass-repeat">تکرار رمز عبور</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-reg-pass-repeat"
                  type={showRegPassword ? "text" : "password"}
                  dir="ltr"
                  placeholder="••••••••••"
                  value={regPasswordRepeat}
                  onChange={(e) => setRegPasswordRepeat(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? "در حال ثبت‌نام..." : "عضویت در خانواده مرد کوهستان"}
            </button>

            <div className="auth-footer-prompt">
              <span>قبلاً ثبت‌نام کرده‌اید؟</span>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => setModalTab("login")}
              >
                ورود به حساب
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
