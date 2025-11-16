"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Container from "./Container";

type NavItem = {
  name: string;
  href: string;
};

const mainNav: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Jobs", href: "/jobs" },
  { name: "Talent Network", href: "/talent-network" },
  { name: "For Employers", href: "/employers" },
  { name: "Insights", href: "/insights" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <Container>
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 via-emerald-500 to-amber-400 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
                R
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-slate-900">
                  Resourcin
                </span>
                <span className="text-[11px] text-slate-500">
                  Talent · EOR · Advisory
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {mainNav.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={classNames(
                    "transition-colors",
                    isActive
                      ? "text-sky-700 font-medium"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/request-talent"
              className="inline-flex items-center rounded-full border border-sky-500 bg-sky-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-sky-600 hover:border-sky-600 transition-colors"
            >
              Request Talent
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileOpen ? (
              // X icon
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // Hamburger
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 6h14M3 10h14M3 14h14"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile nav panel */}
        {mobileOpen && (
          <div className="md:hidden pb-3 border-t border-slate-200">
            <nav className="flex flex-col space-y-1 pt-3">
              {mainNav.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={classNames(
                      "px-2 py-1.5 text-sm rounded-md",
                      isActive
                        ? "bg-sky-50 text-sky-700 font-medium"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <div className="mt-2 flex items-center gap-2 px-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-sm text-slate-700 py-1.5 text-center rounded-md border border-slate-200 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  href="/request-talent"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-sm text-white py-1.5 text-center rounded-md bg-sky-500 hover:bg-sky-600"
                >
                  Request Talent
                </Link>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
