"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { useTranslation } from "@/lib/i18n/useTranslation";

/** `scoped`: the site-nav stylesheet owns the look (data-part="tool"); no utility classes. */
export default function ThemeToggle({ scoped = false }: { scoped?: boolean }) {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t('theme.toggleLight') : t('theme.toggleDark')}
      data-part={scoped ? 'tool' : undefined}
      className={scoped ? undefined : `flex items-center justify-center w-8 h-8
                 text-fg-muted hover:text-fg
                 transition-colors duration-150 ease-quick
                 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-[3px]`}
    >
      {isDark ? <SunIcon scoped={scoped} /> : <MoonIcon scoped={scoped} />}
    </button>
  );
}

function SunIcon({ scoped }: { scoped?: boolean }) {
  return (
    <svg
      width={scoped ? 18 : 16} height={scoped ? 18 : 16} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"     x2="12" y2="3"     />
      <line x1="12" y1="21"    x2="12" y2="23"    />
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"   />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12"    x2="3"  y2="12"    />
      <line x1="21" y1="12"    x2="23" y2="12"    />
      <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"  />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
    </svg>
  );
}

function MoonIcon({ scoped }: { scoped?: boolean }) {
  return (
    <svg
      width={scoped ? 18 : 16} height={scoped ? 18 : 16} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
