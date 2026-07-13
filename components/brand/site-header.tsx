"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/brand/language-switcher";
import { BrandLockup } from "@/components/brand/wordmark";
import { ButtonLink } from "@/components/ui/button";
import { primaryNav, utilityNav } from "@/lib/site";

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const onHome = pathname === "/";
  const overHero = onHome && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    const firstLink = panelRef.current?.querySelector<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    firstLink?.focus();

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const closeMenu = () => setOpen(false);

  const primaryLinkClass = (active: boolean) => {
    if (overHero) {
      return [
        "relative inline-flex min-h-11 items-center px-1 text-sm font-medium tracking-wide transition-colors duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
        active ? "text-foam" : "text-foam/75 hover:text-foam",
      ].join(" ");
    }
    return [
      "relative inline-flex min-h-11 items-center px-1 text-sm font-medium tracking-wide transition-colors duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
      active ? "text-ink" : "text-ink-muted hover:text-ink",
    ].join(" ");
  };

  const utilityLinkClass = overHero
    ? "inline-flex min-h-11 items-center text-sm text-foam/65 transition-colors duration-[var(--duration-ui)] hover:text-foam"
    : "inline-flex min-h-11 items-center text-sm text-ink-soft transition-colors duration-[var(--duration-ui)] hover:text-ink";

  const activeBarClass = overHero ? "bg-foam" : "bg-brand";

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50",
        "transition-[background-color,backdrop-filter,border-color,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)]",
        overHero
          ? "border-b border-foam/10 bg-map-void/25 backdrop-blur-xl supports-[backdrop-filter]:bg-map-void/20"
          : "border-b border-mist/70 bg-foam/75 shadow-[0_1px_0_rgb(10_22_32_/_0.04)] backdrop-blur-xl supports-[backdrop-filter]:bg-foam/65",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6 lg:h-[4.25rem] lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center"
          onClick={closeMenu}
          aria-label="Q Pick home"
        >
          <BrandLockup
            href=""
            tone={overHero ? "foam" : "ink"}
            logoSize={36}
            wordmarkSize="sm"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {primaryNav.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={primaryLinkClass(active)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
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

        <div className="hidden items-center gap-4 lg:flex">
          {utilityNav.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={utilityLinkClass}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <LanguageSwitcher />
          <ButtonLink
            href="/ride"
            size="md"
            variant={overHero ? "onDark" : "primary"}
          >
            Book Now
          </ButtonLink>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className={[
            "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] border transition-[background-color,border-color,color] duration-[var(--duration-ui)] ease-[var(--ease-cinematic)] lg:hidden",
            overHero
              ? "border-foam/25 bg-foam/10 text-foam backdrop-blur-md"
              : "border-mist/80 bg-paper/70 text-ink backdrop-blur-md",
          ].join(" ")}
          aria-expanded={open}
          aria-controls={menuId}
          aria-haspopup="dialog"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
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

      <div
        id={menuId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={[
          "lg:hidden",
          "overflow-hidden border-t transition-[max-height,opacity,border-color] duration-[var(--duration-reveal)] ease-[var(--ease-cinematic)]",
          open
            ? "max-h-[calc(100dvh-4rem)] border-mist/60 opacity-100"
            : "pointer-events-none max-h-0 border-transparent opacity-0",
          overHero
            ? "bg-map-void/90 backdrop-blur-2xl"
            : "bg-foam/95 backdrop-blur-2xl",
        ].join(" ")}
      >
        <div className="flex min-h-[min(100dvh-4rem,36rem)] flex-col px-5 pb-10 pt-4 sm:px-6">
          <nav className="flex flex-col gap-1" aria-label="Mobile primary">
            {primaryNav.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={closeMenu}
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
                    {item.label}
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
                  className={[
                    "rounded-[var(--radius-md)] px-3 py-2.5 text-base transition-colors duration-[var(--duration-ui)]",
                    overHero
                      ? "text-foam/70 hover:text-foam"
                      : "text-ink-muted hover:text-ink",
                    active ? "font-medium" : "",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="px-3 pt-2">
              <LanguageSwitcher />
            </div>
            <ButtonLink
              href="/ride"
              size="lg"
              className="mt-3 w-full"
              variant={overHero ? "onDark" : "primary"}
              onClick={closeMenu}
            >
              Book Now
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
