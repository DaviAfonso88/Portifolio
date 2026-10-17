'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { getDictionary } from '../../lib/dictionary';
import { cn } from '../../lib/utils';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const dict = getDictionary(locale);

  // Derive equivalent path for the other locale
  const targetLocale = locale === 'pt-BR' ? 'en' : 'pt-BR';
  const switchLocalePath = pathname
    ? pathname.replace(new RegExp(`^/${locale}`), `/${targetLocale}`)
    : `/${targetLocale}`;

  const navLinks = [
    { href: `/${locale}/sobre`, label: dict.nav.about },
    { href: `/${locale}/habilidades`, label: dict.nav.skills },
    { href: `/${locale}/conhecimentos`, label: dict.nav.knowledge },
    { href: `/${locale}/experiencias`, label: dict.nav.experiences },
    { href: `/${locale}/projetos`, label: dict.nav.projects },
    { href: `/${locale}/blog`, label: dict.nav.blog },
    { href: `/${locale}/contato`, label: dict.nav.contact },
  ];

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule bg-paper">
      <div className="mx-auto flex h-[70px] max-w-[1340px] items-center justify-between px-5 md:px-20">
        {/* Brand Logo */}
        <Link
          href={`/${locale}`}
          className="font-serif text-[23px] text-ink tracking-tight transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          davidev
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Navegação Principal"
          className="hidden md:flex items-center gap-[26px] text-sm"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors py-1',
                  isActive
                    ? 'font-medium text-ink border-b-2 border-accent pb-[2px]'
                    : 'text-ink-2 hover:text-ink'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Controls (Locale + Theme) */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Pill */}
          <div className="flex items-center border border-rule rounded-[4px] overflow-hidden font-mono text-[11px]">
            <Link
              href={locale === 'pt-BR' ? pathname : pathname.replace('/en', '/pt-BR')}
              className={cn(
                'px-2.5 py-1.5 transition-colors',
                locale === 'pt-BR'
                  ? 'bg-ink text-paper font-medium'
                  : 'text-ink-3 hover:text-ink'
              )}
              aria-label="PT — Versão em Português"
            >
              PT
            </Link>
            <Link
              href={locale === 'en' ? pathname : pathname.replace('/pt-BR', '/en')}
              className={cn(
                'px-2.5 py-1.5 transition-colors',
                locale === 'en'
                  ? 'bg-ink text-paper font-medium'
                  : 'text-ink-3 hover:text-ink'
              )}
              aria-label="EN — English Version"
            >
              EN
            </Link>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle ariaLabel={dict.header.themeToggleAria} />

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={dict.header.menuToggleAria}
            className="md:hidden size-[38px] flex items-center justify-center rounded-[4px] border border-rule bg-transparent text-ink hover:text-ink-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {mobileMenuOpen ? (
              <X className="size-5 stroke-[1.5]" />
            ) : (
              <Menu className="size-5 stroke-[1.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-rule bg-paper px-6 py-6 transition-all animate-in fade-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4 text-base">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'py-2 border-b border-rule/50 transition-colors',
                    isActive ? 'font-medium text-accent' : 'text-ink-2 hover:text-ink'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
