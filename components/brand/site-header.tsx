"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LanguageSwitcher } from "@/components/brand/language-switcher";
import { BrandLogo } from "@/components/brand/wordmark";
import { useTranslations } from "@/components/i18n/locale-provider";
import { primaryNav, utilityNav } from "@/lib/site";

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const bookNowClass =
  "inline-flex shrink-0 min-h-11 items-center justify-center rounded-full bg-[#0A84FF] px-5 text-sm font-medium text-white shadow-[0_6px_18px_rgb(10_132_255_/_0.28)] transition-[background-color,box-shadow,transform] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] hover:bg-[#0077E6] hover:shadow-[0_8px_22px_rgb(10_132_255_/_0.36)] hover:-translate-y-px active:translate-y-0";

const primaryNavKeys = {
  "/": "home",
  "/ride": "ride",
  "/airport-transfer": "airport",
  "/tours": "tours",
  "/safety": "safety",
  "/drive": "drive",
} as const;

const utilityNavKeys = {
  "/partners": "partners",
  "/support": "support",
} as const;

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const ignoreBackdropUntilRef = useRef(0);
  const prevPathname = useRef(pathname);

  const onHome = pathname === "/";
  const overHero = onHome && !scrolled && !open;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      return;
    }
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    // Defer focus so we don't steal the opening tap / click
    const focusTimer = window.setTimeout(() => {
      const firstLink = panelRef.current?.querySelector<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      // preventScroll avoids iOS jumping the page when the menu opens
      firstLink?.focus({ preventScroll: true });
    }, 50);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Close on real route changes only (not on initial mount)
  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    setOpen(false);
  }, [pathname]);

  const closeMenu = () => setOpen(false);

  const toggleMenu = () => {
    setOpen((value) => {
      if (!value) {
        // Prevent the opening gesture from immediately hitting the backdrop
        ignoreBackdropUntilRef.current = Date.now() + 400;
      }
      return !value;
    });
  };

  const onBackdropClick = () => {
    if (Date.now() < ignoreBackdropUntilRef.current) return;
    closeMenu();
  };

  const primaryLinkClass = (active: boolean) => {
    if (overHero) {
      return [
        "relative inline-flex min-h-11 min-w-0 items-center px-1 text-sm font-medium tracking-wide text-pretty transition-colors duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
        active ? "text-foam" : "text-foam/75 hover:text-foam",
      ].join(" ");
    }
    return [
      "relative inline-flex min-h-11 min-w-0 items-center px-1 text-sm font-medium tracking-wide text-pretty transition-colors duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
      active ? "text-ink" : "text-ink-muted hover:text-ink",
    ].join(" ");
  };

  const utilityLinkClass = overHero
    ? "inline-flex min-h-11 min-w-0 items-center text-sm text-foam/65 text-pretty transition-colors duration-[var(--duration-ui)] hover:text-foam"
    : "inline-flex min-h-11 min-w-0 items-center text-sm text-ink-soft text-pretty transition-colors duration-[var(--duration-ui)] hover:text-ink";

  const activeBarClass = overHero ? "bg-foam" : "bg-brand";

  const navLabel = (href: keyof typeof primaryNavKeys | keyof typeof utilityNavKeys) => {
    if (href in primaryNavKeys) {
      return t(`nav.${primaryNavKeys[href as keyof typeof primaryNavKeys]}`);
    }
    return t(`nav.${utilityNavKeys[href as keyof typeof utilityNavKeys]}`);
  };

  const mobileMenu =
    mounted &&
    createPortal(
      <div
        className={[
          "fixed inset-0 z-[90] lg:hidden",
          "transition-[opacity,visibility] duration-[280ms] ease-[var(--ease-cinematic)]",
          open
            ? "visible opacity-100 pointer-events-auto"
            : "pointer-events-none invisible opacity-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="absolute inset-0 bg-map-void/60 backdrop-blur-sm"
          aria-label={t("header.closeMenu")}
          tabIndex={open ? 0 : -1}
          onClick={onBackdropClick}
        />

        <div
          id={menuId}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("header.mobileNav")}
          className={[
            "absolute inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top))] bottom-0 flex flex-col overflow-hidden border-t",
            "transition-[transform,opacity] duration-[280ms] ease-[var(--ease-cinematic)]",
            open
              ? "translate-y-0 opacity-100"
              : "-translate-y-1 opacity-0",
            overHero
              ? "border-foam/10 bg-map-void"
              : "border-mist/60 bg-foam",
          ].join(" ")}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6">
            {/* Language at top of mobile menu for quick access */}
            <div
              className={[
                "mb-4 flex items-center justify-between gap-3 border-b pb-4",
                overHero ? "border-foam/15" : "border-mist",
              ].join(" ")}
            >
              <p
                className={[
                  "font-mono text-[0.6875rem] font-medium tracking-[0.18em] uppercase",
                  overHero ? "text-foam/55" : "text-ink-soft",
                ].join(" ")}
              >
                {t("language.label")}
              </p>
              <LanguageSwitcher
                tone={overHero ? "onDark" : "default"}
                compact
              />
            </div>

            <nav
              className="flex flex-col gap-1"
              aria-label={t("header.mobilePrimary")}
            >
              {primaryNav.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href === "/" ? "home" : item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMenu}
                    tabIndex={open ? 0 : -1}
                    className={[
                      "rounded-[var(--radius-md)] px-3 py-3.5 text-lg font-medium transition-colors duration-[var(--duration-ui)]",
                      overHero
                        ? active
                          ? "bg-foam/10 text-foam"
                          : "text-foam/80 hover:bg-foam/5 hover:text-foam"
                        : active
                          ? "bg-brand/10 text-ink"
                          : "text-ink hover:bg-mist/50",
                    ].join(" ")}
                  >
                    <span className="flex items-center justify-between gap-3">
                      {navLabel(item.href)}
                      {active ? (
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${overHero ? "bg-foam" : "bg-brand"}`}
                        />
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div
              className={[
                "mt-6 flex flex-col gap-2 border-t pt-6",
                overHero ? "border-foam/15" : "border-mist",
              ].join(" ")}
            >
              {utilityNav.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMenu}
                    tabIndex={open ? 0 : -1}
                    className={[
                      "rounded-[var(--radius-md)] px-3 py-2.5 text-base transition-colors duration-[var(--duration-ui)]",
                      overHero
                        ? "text-foam/70 hover:text-foam"
                        : "text-ink-muted hover:text-ink",
                      active ? "font-medium" : "",
                    ].join(" ")}
                  >
                    {navLabel(item.href)}
                  </Link>
                );
              })}
            </div>

            <div
              className={[
                "sticky bottom-0 mt-auto border-t pt-4 pb-2",
                overHero
                  ? "border-foam/15 bg-map-void"
                  : "border-mist bg-foam",
              ].join(" ")}
            >
              <Link
                href="/ride"
                className={`${bookNowClass} w-full`}
                onClick={closeMenu}
                tabIndex={open ? 0 : -1}
              >
                {t("header.bookNow")}
              </Link>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      {/*
        IMPORTANT: Do NOT put backdrop-filter / filter / transform on <header>.
        Those make position:fixed descendants use the header as containing block,
        collapsing the mobile menu to ~1px. Glass lives on a sibling layer instead.
      */}
      <header
        className={[
          "fixed inset-x-0 top-0 z-[100] pt-[env(safe-area-inset-top)]",
          "transition-[border-color,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute inset-0 -z-10 border-b",
            "transition-[background-color,backdrop-filter,border-color,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
            overHero
              ? "border-foam/10 bg-map-void/25 backdrop-blur-xl supports-[backdrop-filter]:bg-map-void/20"
              : "border-mist/70 bg-foam/75 shadow-[0_1px_0_rgb(10_22_32_/_0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-foam/65",
          ].join(" ")}
        />

        <div className="relative z-[110] mx-auto flex h-[4.5rem] w-full min-w-0 max-w-6xl items-center justify-between gap-3 px-5 sm:gap-4 sm:px-6 lg:h-20 lg:px-8">
          <Link
            href="/"
            className="relative z-[110] inline-flex h-11 shrink-0 items-center"
            onClick={closeMenu}
            aria-label={t("header.homeAria")}
          >
            <BrandLogo
              size={72}
              priority
              className="!h-14 !w-14 sm:!h-[4.25rem] sm:!w-[4.25rem] lg:!h-[4.5rem] lg:!w-[4.5rem]"
            />
          </Link>

          <nav
            className="locale-nav hidden min-w-0 items-center lg:flex"
            aria-label={t("header.primaryNav")}
          >
            {primaryNav.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href === "/" ? "home" : item.href}
                  href={item.href}
                  className={primaryLinkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {navLabel(item.href)}
                  <span
                    aria-hidden="true"
                    className={[
                      "pointer-events-none absolute inset-x-1 -bottom-0.5 h-px origin-left rounded-full transition-transform duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
                      activeBarClass,
                      active ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-4 lg:flex">
            {utilityNav.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={utilityLinkClass}
                  aria-current={active ? "page" : undefined}
                >
                  {navLabel(item.href)}
                </Link>
              );
            })}
            <LanguageSwitcher tone={overHero ? "onDark" : "default"} />
            <Link href="/ride" className={bookNowClass}>
              {t("header.bookNow")}
            </Link>
          </div>

          <div className="relative z-[120] flex shrink-0 items-center gap-2 lg:hidden">
            <LanguageSwitcher
              tone={overHero ? "onDark" : "default"}
              compact
              className="pointer-events-auto"
            />
            <button
              ref={menuButtonRef}
              type="button"
              className={[
                "relative pointer-events-auto inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-[var(--radius-md)] border transition-[background-color,border-color,color] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
                overHero
                  ? "border-foam/25 bg-foam/10 text-foam backdrop-blur-md"
                  : "border-mist/80 bg-paper/70 text-ink backdrop-blur-md",
              ].join(" ")}
              aria-expanded={open}
              aria-controls={menuId}
              aria-haspopup="dialog"
              onClick={toggleMenu}
            >
              <span className="sr-only">
                {open ? t("header.closeMenu") : t("header.openMenu")}
              </span>
              <span className="pointer-events-none flex w-5 flex-col gap-1.5" aria-hidden="true">
                <span
                  className={[
                    "h-0.5 w-full rounded-full transition-transform duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
                    overHero ? "bg-foam" : "bg-ink",
                    open ? "translate-y-2 rotate-45" : "",
                  ].join(" ")}
                />
                <span
                  className={[
                    "h-0.5 w-full rounded-full transition-opacity duration-[var(--duration-micro)]",
                    overHero ? "bg-foam" : "bg-ink",
                    open ? "opacity-0" : "opacity-100",
                  ].join(" ")}
                />
                <span
                  className={[
                    "h-0.5 w-full rounded-full transition-transform duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
                    overHero ? "bg-foam" : "bg-ink",
                    open ? "-translate-y-2 -rotate-45" : "",
                  ].join(" ")}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {mobileMenu}
    </>
  );
}
