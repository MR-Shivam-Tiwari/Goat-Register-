"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({
  items,
  isGuest,
  t,
  locale: propLocale,
}: {
  items: BreadcrumbItem[];
  isGuest?: boolean;
  t?: any;
  locale?: string;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dbBreeds, setDbBreeds] = useState<{ name: string; alias: string }[]>([]);
  const navRef = useRef<HTMLElement>(null);
  const params = useParams();

  const alias = params.alias as string;
  const slug = params.slug as string[];
  const sex = slug ? slug[0] : "female";
  const locale = (propLocale || params.lang || "ru") as "ru" | "en" | "uk";

  useEffect(() => {
    setMounted(true);
    // Fetch breeds dynamically to replace static lists
    fetch('/api/breeds')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbBreeds(data.map(b => ({ name: b.name, alias: b.alias })));
        }
      })
      .catch(err => console.error('Failed to fetch breeds for breadcrumbs:', err));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveIdx(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const registries = [
    {
      label: t?.rules?.rhbTitle?.toUpperCase() || "MAIN REGISTRY (RHB)",
      href: `/catalog/goats/${alias}/${sex}?reg=rhb`,
    },
    {
      label:
        t?.rules?.rcbTitle?.toUpperCase() ||
        "ABSORPTION CROSSING REGISTRY (RCB)",
      href: `/catalog/goats/${alias}/${sex}?view=rcb`,
    },
    {
      label: t?.rules?.rfbTitle?.toUpperCase() || "PHENOTYPE REGISTRY (RFB)",
      href: `/catalog/goats/${alias}/${sex}?reg=rfb`,
    },
    {
      label:
        t?.rules?.rexbTitle?.toUpperCase() || "EXPERIMENTAL REGISTRY (RExB)",
      href: `/catalog/goats/${alias}/${sex}?view=ex`,
    },
  ];

  const genders = [
    {
      label: t?.goats?.female?.toUpperCase() || "DOES (GOATS)",
      href: `/catalog/goats/${alias}/female`,
    },
    {
      label: t?.goats?.male?.toUpperCase() || "BUCKS (GOATS)",
      href: `/catalog/goats/${alias}/male`,
    },
    {
      label: t?.catalog?.youngAnimals?.toUpperCase() || "YOUNG ANIMALS",
      href: `/catalog/goats/${alias}/child`,
    },
  ];

  const getItemType = (label: string | any, index: number) => {
    const l = (label || "").toString().toLowerCase();
    if (!l || l.includes("catalog") || l.includes("каталог")) return null;

    // Determine type based on context and current data
    if ((index === 0 && alias && !isGuest)) return "breed";

    if (
      l.includes("реестр") ||
      l.includes("registry") ||
      l.includes("registries") ||
      l.includes("племінні") ||
      l.includes("rhb") ||
      l.includes("rcb") ||
      l.includes("rfb") ||
      l.includes("rexb") ||
      l.startsWith("f")
    )
      return "registry";
    if (
      l.includes("коз") ||
      l.includes("goat") ||
      l.includes("doe") ||
      l.includes("buck") ||
      l.includes("коза") ||
      l.includes("козел") ||
      l.includes("кози") ||
      l.includes("kid") ||
      l.includes("young") ||
      l.includes("молодняк") ||
      l.includes("потомство") ||
      l.includes("offspring") ||
      l.includes("descendant")
    )
      return "gender";

    return null;
  };

  return (
    <div className="w-full sm:w-fit max-w-full bg-[#D9C1A3] flex px-6 py-2.5 rounded shadow-sm border border-[#CFA979]/50 select-none">
      <nav
        ref={navRef}
        className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-[12px] font-bold text-[#491907]"
      >
        {!isGuest && (
          <span className="opacity-60 normal-case font-medium mr-1 whitespace-nowrap">
            {t?.common?.youAreHere || "You are here:"}
          </span>
        )}

        {/* HOME */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="hover:underline transition-colors whitespace-nowrap"
          >
            {t?.nav?.home || "Home"}
          </Link>
          <span className="text-[#491907]/30 font-light select-none">•</span>
        </div>

        {/* CATALOG */}
        <div className="flex items-center gap-3">
          <Link
            href="/catalog/goats"
            target="_blank"
            className="hover:underline transition-colors whitespace-nowrap"
          >
            {t?.catalog?.breadcrumbs || "Catalog"}
          </Link>
          <span className="text-[#491907]/30 font-light select-none">•</span>
        </div>

        {items
          .filter((item) => {
            const label = (item?.label || "").toString().toLowerCase();
            return (
              label && !label.includes("catalog") && !label.includes("каталог")
            );
          })
          .map((item, index, filteredItems) => {
            const isLast = index === filteredItems.length - 1;
            const type = getItemType(item.label, index);
            const isOpen = activeIdx === index;

            // No more static renaming - use backend label directly
            let labelToDisplay = item.label;

            let dropdownItems: { label: string; href: string }[] = [];
            if (type === "registry") {
              const l = item.label.toLowerCase();
              const isCategory =
                l.includes("breeding registries") ||
                l.includes("племенные реестры") ||
                l.includes("племінні реєстри") ||
                l.includes("registries");

              if (sex === "child") {
                dropdownItems = [
                  {
                    label: t?.catalog?.kidsGrid?.male03?.toUpperCase() || "BUCKS 0-3 MONTHS",
                    href: `/catalog/goats/${alias}/child?s=male&age=3`,
                  },
                  {
                    label: t?.catalog?.kidsGrid?.male36?.toUpperCase() || "BUCKS 3-6 MONTHS",
                    href: `/catalog/goats/${alias}/child?s=male&age=6`,
                  },
                  {
                    label: t?.catalog?.kidsGrid?.male612?.toUpperCase() || "BUCKS 6-12 MONTHS",
                    href: `/catalog/goats/${alias}/child?s=male&age=12`,
                  },
                  {
                    label: t?.catalog?.kidsGrid?.female03?.toUpperCase() || "DOES 0-3 MONTHS",
                    href: `/catalog/goats/${alias}/child?s=female&age=3`,
                  },
                  {
                    label: t?.catalog?.kidsGrid?.female36?.toUpperCase() || "DOES 3-6 MONTHS",
                    href: `/catalog/goats/${alias}/child?s=female&age=6`,
                  },
                  {
                    label: t?.catalog?.kidsGrid?.female612?.toUpperCase() || "DOES 6-12 MONTHS",
                    href: `/catalog/goats/${alias}/child?s=female&age=12`,
                  },
                ];
              } else if (l.includes("rcb") || l.includes("absorption")) {
                dropdownItems = [
                  { label: "F1", href: `/catalog/goats/${alias}/${sex}?reg=f1` },
                  { label: "F2", href: `/catalog/goats/${alias}/${sex}?reg=f2` },
                  { label: "F3", href: `/catalog/goats/${alias}/${sex}?reg=f3` },
                  { label: "F4", href: `/catalog/goats/${alias}/${sex}?reg=f4` },
                  { label: "F5", href: `/catalog/goats/${alias}/${sex}?reg=f5` },
                  { label: "F6", href: `/catalog/goats/${alias}/${sex}?reg=f6` },
                  { label: "F7", href: `/catalog/goats/${alias}/${sex}?reg=f7` },
                  { label: "F8", href: `/catalog/goats/${alias}/${sex}?reg=f8` },
                ];
              } else if (l.includes("rexb") || l.includes("experimental")) {
                dropdownItems = [
                  { label: "RExB 1", href: `/catalog/goats/${alias}/${sex}?reg=ex1` },
                  { label: "RExB 2", href: `/catalog/goats/${alias}/${sex}?reg=ex2` },
                  { label: "RExB 3", href: `/catalog/goats/${alias}/${sex}?reg=ex3` },
                ];
              } else if (isCategory) {
                dropdownItems = registries;
              } else {
                dropdownItems = registries;
              }
            } else if (type === "gender") {
              const l = item.label.toLowerCase();
              if (
                l.includes("потомство") ||
                l.includes("offspring") ||
                l.includes("descendant")
              ) {
                dropdownItems = [
                  { label: t?.catalog?.kidsGrid?.male03?.toUpperCase() || "BUCKS 0-3 MONTHS", href: `/catalog/goats/${alias}/child?s=male&age=3` },
                  { label: t?.catalog?.kidsGrid?.male36?.toUpperCase() || "BUCKS 3-6 MONTHS", href: `/catalog/goats/${alias}/child?s=male&age=6` },
                  { label: t?.catalog?.kidsGrid?.male612?.toUpperCase() || "BUCKS 6-12 MONTHS", href: `/catalog/goats/${alias}/child?s=male&age=12` },
                  { label: t?.catalog?.kidsGrid?.female03?.toUpperCase() || "DOES 0-3 MONTHS", href: `/catalog/goats/${alias}/child?s=female&age=3` },
                  { label: t?.catalog?.kidsGrid?.female36?.toUpperCase() || "DOES 3-6 MONTHS", href: `/catalog/goats/${alias}/child?s=female&age=6` },
                  { label: t?.catalog?.kidsGrid?.female612?.toUpperCase() || "DOES 6-12 MONTHS", href: `/catalog/goats/${alias}/child?s=female&age=12` },
                ];
              } else {
                dropdownItems = genders;
              }
            } else if (type === "breed") {
              dropdownItems = dbBreeds.map((b) => ({
                label: b.name.toUpperCase(),
                href: `/catalog/goats/${b.alias.trim()}`,
              }));
            }

            return (
              <div
                key={index}
                className="flex items-center gap-3 relative"
                onMouseEnter={() => type && setActiveIdx(index)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                <div
                  onClick={() => type && setActiveIdx(isOpen ? null : index)}
                  className={`flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${isOpen ? "text-white" : "hover:text-white/80"}`}
                >
                  <span
                    className={`tracking-tight ${isLast ? "font-black" : ""}`}
                  >
                    {labelToDisplay}
                  </span>

                  {mounted && dropdownItems.length > 0 && (
                    <svg
                      className={`w-2 h-2 ml-1 transition-transform ${isOpen ? "rotate-180 text-white" : "opacity-40"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={4}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>

                {/* DROPDOWN MENU */}
                {isOpen && dropdownItems.length > 0 && (
                  <>
                    <div className="absolute top-full left-0 w-full h-2 z-[9998]"></div>
                    <div className="absolute top-[calc(100%+5px)] left-0 min-w-[280px] bg-white border border-gray-200 shadow-2xl z-[9999] py-1 rounded-sm overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                      {dropdownItems.map((d, dIdx) => (
                        <Link
                          key={dIdx}
                          href={d.href}
                          target="_blank"
                          onClick={() => setActiveIdx(null)}
                          className="block px-5 py-2.5 hover:bg-[#FEFBF5] text-[#491907] transition-colors border-b last:border-0 border-gray-50 text-[11px] font-bold tracking-tight"
                        >
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}

                {!isLast && (
                  <span className="text-[#491907]/30 font-light select-none">
                    •
                  </span>
                )}
              </div>
            );
          })}
      </nav>
    </div>
  );
}
