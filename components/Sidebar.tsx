"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_GROUPS = [
  {
    label: "REPORT",
    links: [{ href: "/report", label: "Full Insights" }],
  },
  {
    label: "FUNNEL",
    links: [{ href: "/funnel", label: "Step Funnel" }],
  },
  {
    label: "COMPOSITION",
    links: [
      { href: "/composition/age", label: "Age Bands" },
      { href: "/composition/gender", label: "Gender" },
      { href: "/composition/region", label: "Region" },
      { href: "/composition/payer-type", label: "Payer Type" },
      { href: "/composition/site-of-care", label: "Site of Care" },
    ],
  },
  {
    label: "TOP N",
    links: [
      { href: "/top/payers", label: "Top 5 Payers" },
      { href: "/top/specialties", label: "Top 5 Specialties" },
      { href: "/top/states", label: "Top 5 States" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-[60px] items-center px-6">
        <Link
          href="/"
          onClick={closeSidebar}
          className="text-[15px] font-bold tracking-tight text-text"
        >
          PATIENT FUNNEL
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="mb-4">
          <Link
            href="/"
            onClick={closeSidebar}
            className={`block rounded-md px-3 py-2 text-[14px] font-medium transition-colors ${
              pathname === "/"
                ? "bg-[#EEF3FF] text-accent"
                : "text-text hover:bg-surface"
            }`}
          >
            Overview
          </Link>
        </div>
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              {group.label}
            </h3>
            <ul className="space-y-1">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeSidebar}
                    className={`block rounded-md px-3 py-2 text-[14px] font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-[#EEF3FF] text-accent"
                        : "text-text hover:bg-surface"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden flex h-[60px] items-center border-b border-border bg-surface px-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-text hover:bg-surface-hover rounded-md"
        >
          <Menu size={24} />
        </button>
        <Link href="/" className="ml-4 text-[15px] font-bold tracking-tight text-text">
          PATIENT FUNNEL
        </Link>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 top-0 z-50 w-[240px] border-r border-border bg-surface transition-transform duration-300 ease-in-out lg:static lg:block ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <button
          onClick={closeSidebar}
          className="absolute right-4 top-4 p-2 text-text lg:hidden"
        >
          <X size={24} />
        </button>
        {navContent}
      </div>
    </>
  );
}
