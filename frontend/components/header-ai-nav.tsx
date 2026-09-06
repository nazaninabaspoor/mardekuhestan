"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const AI_DESK_HREF = "/profile?tab=ai-nutrition&open=1";
export const MK_OPEN_AI_DESK = "mk-open-ai-desk";

function AiSparkIcon() {
  return (
    <svg className="v2-nav-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
    </svg>
  );
}

export function goToAiDesk() {
  window.dispatchEvent(new CustomEvent(MK_OPEN_AI_DESK));
}

export function HeaderAiNavItem({
  onGuestClick,
  onNavigate,
}: {
  onGuestClick: () => void;
  onNavigate?: () => void;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  return (
    <button
      type="button"
      className="v2-nav-link v2-nav-ai"
      disabled={isLoading}
      onClick={() => {
        if (user) {
          goToAiDesk();
          router.push(AI_DESK_HREF);
          onNavigate?.();
          return;
        }
        onGuestClick();
        onNavigate?.();
      }}
      aria-label="دستیار هوش مصنوعی تغذیه مرد کوهستان"
    >
      <AiSparkIcon />
      <span className="v2-nav-label">هوش مصنوعی</span>
    </button>
  );
}

export function HeaderAiGate({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { openLoginModal, openRegisterModal } = useAuth();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const afterAuth = { next: AI_DESK_HREF, reason: "ai" as const };

  return (
    <div className="mk-ai-gate" role="dialog" aria-modal="true" aria-labelledby="mk-ai-gate-title">
      <button type="button" className="mk-ai-gate-veil" aria-label="بستن" onClick={onClose} />
      <div className="mk-ai-gate-card">
        <span className="mk-ai-gate-peak" aria-hidden="true" />
        <Image
          src="/brand/orginal-clear.png"
          alt=""
          width={64}
          height={64}
          className="mk-ai-gate-mark"
        />
        <p className="mk-ai-gate-kicker">راهیار تغذیه</p>
        <h2 id="mk-ai-gate-title">هوش مصنوعی مرد کوهستان</h2>
        <span className="mk-ai-gate-rule" aria-hidden="true" />
        <p className="mk-ai-gate-line">
          این میز فقط برای همسفر خانواده باز است. ابتدا وارد شوید یا عضویت بگیرید تا دستیار تغذیه کنارتان بنشیند.
        </p>
        <p className="mk-ai-gate-motto">این راه سبز است</p>
        <div className="mk-ai-gate-actions">
          <button
            type="button"
            className="mk-ai-gate-btn is-forest"
            onClick={() => {
              onClose();
              openLoginModal(afterAuth);
            }}
          >
            ورود به حساب
          </button>
          <button
            type="button"
            className="mk-ai-gate-btn is-cream"
            onClick={() => {
              onClose();
              openRegisterModal(afterAuth);
            }}
          >
            عضویت در خانواده
          </button>
        </div>
        <button type="button" className="mk-ai-gate-later" onClick={onClose}>
          بعداً
        </button>
      </div>
    </div>
  );
}
