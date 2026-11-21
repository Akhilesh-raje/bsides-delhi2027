"use client";

import { NAV } from "@/lib/content";
import { useState } from "react";
import { MobileMenu } from "./MobileMenu";

const navLinks = NAV;

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between rounded-2xl border border-gunmetal/50 bg-obsidian/80 px-6 py-3 backdrop-blur-xl">
            {/* Logo */}
            <a href="#hero" className="flex items-center gap-2 group">
              <span className="text-signal font-mono text-lg font-bold">◆</span>
              <span className="font-display font-bold text-lg tracking-tight text-silver group-hover:text-signal transition-colors">
                NEO-DELHI
              </span>
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm text-muted hover:text-silver transition-colors rounded-lg hover:bg-surface"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Register CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <a
                href="#tickets"
                className="hidden sm:inline-flex items-center gap-2 bg-signal hover:bg-signal/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(214,46,66,0.3)]"
              >
                Get tickets
                <span className="text-xs opacity-70">→</span>
              </a>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 text-muted hover:text-silver"
                aria-label="Toggle menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {menuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} />
    </>
  );
}
