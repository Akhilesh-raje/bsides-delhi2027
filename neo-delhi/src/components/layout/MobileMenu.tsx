"use client";

import { useEffect } from "react";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
};

export function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-obsidian/95 backdrop-blur-xl" onClick={onClose} />

      {/* Menu content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 p-8">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="text-2xl font-display font-medium text-silver hover:text-signal transition-colors"
          >
            {link.label}
          </a>
        ))}

        <div className="mt-8 border-t border-gunmetal pt-8">
          <a
            href="#tickets"
            onClick={onClose}
            className="inline-flex items-center gap-3 bg-signal text-white px-8 py-4 rounded-xl text-lg font-medium hover:shadow-[0_0_30px_rgba(214,46,66,0.4)] transition-all"
          >
            Get tickets
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
