"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { CatalogSearchBox } from "@/components/catalog-search-box";
import { AuthHeaderButton } from "@/components/auth-header-button";
import { AuthModal } from "@/components/auth-modal";

const v2NavItems = [
  { id: "story", href: "/#v2-magazine", label: "داستان ما", icon: "book" },
  { id: "way", href: "/#coming-soon", label: "راه ما", icon: "mountain" },
  { id: "chain", href: "/#v2-catalogs", label: "مسیر غذا", icon: "path" },
  { id: "products", href: "/#for-home-kitchen", label: "محصولات", icon: "olive" },
] as const;

function V2NavIcon({ icon }: { icon: (typeof v2NavItems)[number]["icon"] }) {
  const paths = {
    book: <path d="M4 5.5c2.8-.8 5-.2 6 1.1v11c-1-1.3-3.2-1.9-6-1.1v-11Zm16 0c-2.8-.8-5-.2-6 1.1v11c1-1.3 3.2-1.9 6-1.1v-11Z" />,
    mountain: <path d="m3 18 6.2-10 2.4 3.7L14.5 7 21 18H3Zm4.4-3.8 1.8-2.9 1.2 1.9 1.2-1.9 2.9 4.7" />,
    path: <path d="M6 20c0-5.4 8-4 8-9.1 0-2.1-1.6-3.5-4.2-4.9M15.5 4.5 18 3l1.5 2.5L17 7l-1.5-2.5Z" />,
    olive: <path d="M5 19c4.2-1.7 7-5.4 9.2-11M8.4 14.4C5.2 14.5 3.7 12.8 4 10c3.1-.1 4.8 1.4 4.4 4.4Zm3.4-3.9c-2.8-1-3.6-3-2.5-5.4 2.9.9 3.7 2.8 2.5 5.4Zm2.1 5.7c.7-3 2.6-4.2 5.2-3.4-.6 3-2.4 4.2-5.2 3.4Z" />,
  } as const;

  return (
    <svg className="v2-nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[icon]}
    </svg>
  );
}

export function V2SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const logoImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useLayoutEffect(() => {
    const logo = logoImageRef.current;
    if (!logo) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      logo.style.opacity = "1";
      setLogoReady(true);
      return;
    }

    let clone: HTMLImageElement | null = null;
    let animation: Animation | null = null;
    let cancelled = false;

    const run = () => {
      if (cancelled || !logo.isConnected) return;

      const rect = logo.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) {
        logo.style.opacity = "1";
        setLogoReady(true);
        return;
      }

      const offsetX = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const offsetY = window.innerHeight * 0.48 - (rect.top + rect.height / 2);
      const introTransform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(2.05)`;

      clone = logo.cloneNode(true) as HTMLImageElement;
      clone.removeAttribute("class");
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      Object.assign(clone.style, {
        position: "fixed",
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: "0",
        zIndex: "300",
        pointerEvents: "none",
        objectFit: "contain",
        transformOrigin: "center",
        transform: introTransform,
        opacity: "0",
        visibility: "visible",
        filter: "brightness(0.96)",
        willChange: "transform, opacity",
      });

      logo.style.opacity = "0";
      document.body.appendChild(clone);

      animation = clone.animate(
        [
          { opacity: 0, filter: "brightness(0.96)", transform: introTransform, offset: 0 },
          { opacity: 1, filter: "brightness(1.03)", transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(2.18)`, offset: 0.22 },
          { opacity: 1, filter: "brightness(1)", transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(2.18)`, offset: 0.34 },
          { opacity: 1, filter: "brightness(1)", transform: "translate3d(0, 0, 0) scale(1)", offset: 1 },
        ],
        { duration: 1900, easing: "cubic-bezier(0.2, 0.72, 0.2, 1)", fill: "forwards" },
      );

      animation.finished.then(() => {
        if (cancelled) return;
        logo.style.opacity = "1";
        setLogoReady(true);
        clone?.remove();
        clone = null;
      }).catch(() => undefined);
    };

    if (logo.complete && logo.naturalWidth > 0) run();
    else logo.addEventListener("load", run, { once: true });

    return () => {
      cancelled = true;
      logo.removeEventListener("load", run);
      animation?.cancel();
      clone?.remove();
      logo.style.opacity = "1";
    };
  }, []);

  return (
    <header className={`site-header site-header--v2${scrolled ? " is-scrolled" : ""}`}>
      <div className="v2-header-body">
        <div className="shell v2-header-plate">
          <div className="v2-menubar">
            <div className="v2-brand-cluster">
              <Link href="/" className="v2-logo" aria-label="مرد کوهستان، بازگشت به خانه">
                <Image
                  src="/brand/orginal-clear.png"
                  alt=""
                  width={88}
                  height={88}
                  priority
                  className="v2-logo-img"
                  ref={logoImageRef}
                  style={{ opacity: logoReady ? 1 : 0 }}
                />
              </Link>

              <nav className="v2-primary-nav" aria-label="منوی اصلی">
                {v2NavItems.map((item) => (
                  <Link key={item.id} href={item.href} className="v2-nav-link">
                    <V2NavIcon icon={item.icon} />
                    <span className="v2-nav-label">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="v2-menubar-spacer" aria-hidden="true" />

            <div className="v2-menubar-actions">
              <CatalogSearchBox
                className="v2-header-search"
                variant="v2"
                placeholder="جستجو در راه سبز…"
              />
              <AuthHeaderButton />
            </div>

            <button
              type="button"
              className="v2-menu-toggle"
              aria-expanded={open}
              aria-controls="v2-mobile-menu"
              aria-label={open ? "بستن منو" : "باز کردن منو"}
              onClick={() => setOpen((value) => !value)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      <nav
        id="v2-mobile-menu"
        className={`v2-mobile-panel${open ? " is-open" : ""}`}
        aria-label="منوی موبایل"
      >
        <div className="shell">
          <div className="v2-mobile-auth-wrapper">
            <AuthHeaderButton
              variant="mobile"
              onItemClick={() => setOpen(false)}
            />
          </div>

          <CatalogSearchBox
            className="v2-header-search v2-header-search--mobile"
            variant="v2"
            placeholder="جستجو در راه سبز…"
          />
          {v2NavItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="v2-nav-link"
              onClick={() => setOpen(false)}
            >
              <V2NavIcon icon={item.icon} />
              <span className="v2-nav-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <AuthModal />
    </header>
  );
}
