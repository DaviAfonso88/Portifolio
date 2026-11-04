'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';

interface AdminSidebarProps {
  open: boolean;
  onOpenChange(open: boolean): void;
}

/** Fixa a partir de lg. Abaixo disso, a mesma navegação abre como gaveta pela barra superior. */
export function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout, authFetch } = useAdminAuth();
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    } else if (wasOpenRef.current) {
      openButtonRef.current?.focus();
    }
    wasOpenRef.current = open;

    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  // Sem valor inicial nos contadores: até a API responder, nenhum número aparece.
  const [stats, setStats] = useState<{
    postsCount?: number;
    trashCount?: number;
    unnotifiedMessages: number;
  }>({ unnotifiedMessages: 0 });

  useEffect(() => {
    // Optionally fetch dynamic badge counts
    let active = true;
    async function loadStats() {
      try {
        const [postsRes, messagesRes] = await Promise.all([
          authFetch('/api/v1/admin/posts?limit=1'),
          authFetch('/api/v1/admin/messages?limit=1'),
        ]);

        if (active && postsRes.ok) {
          const postsData = await postsRes.json();
          setStats((prev) => ({
            ...prev,
            postsCount: postsData.total ?? prev.postsCount,
            trashCount: postsData.trashCount ?? prev.trashCount,
          }));
        }

        if (active && messagesRes.ok) {
          const messagesData = await messagesRes.json();
          setStats((prev) => ({
            ...prev,
            unnotifiedMessages: messagesData.unnotifiedCount ?? prev.unnotifiedMessages,
          }));
        }
      } catch {
        // Fallback to initial stats
      }
    }

    if (user) {
      loadStats();
    }
    return () => {
      active = false;
    };
  }, [user, authFetch]);

  const navItems = [
    {
      name: 'Artigos',
      href: '/admin/posts',
      active: pathname === '/admin/posts' || pathname.startsWith('/admin/posts/editor'),
      badge: stats.postsCount,
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M9 10h6M9 14h6" />
        </svg>
      ),
    },
    {
      name: 'Lixeira',
      href: '/admin/posts/lixeira',
      active: pathname === '/admin/posts/lixeira',
      badge: stats.trashCount,
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
        </svg>
      ),
    },
    {
      name: 'Categorias e tags',
      href: '/admin/taxonomia',
      active: pathname === '/admin/taxonomia',
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      ),
    },
    {
      name: 'Mensagens',
      href: '/admin/mensagens',
      active: pathname === '/admin/mensagens',
      badgePill: stats.unnotifiedMessages > 0 ? stats.unnotifiedMessages : undefined,
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6h18v12H3z" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Top bar: below lg */}
      <header
        inert={open}
        className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between gap-3 pl-4 pr-1.5 sm:pl-7 sm:pr-4 bg-[#1C1A17] select-none"
      >
        <div className="flex items-baseline gap-2.5">
          <Link href="/admin/posts" className="font-display text-[22px] text-[#FAF8F4] tracking-normal">
            davidev
          </Link>
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#7C736A]">
            Painel
          </span>
        </div>
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="admin-nav"
          className="w-11 h-11 inline-flex items-center justify-center rounded text-[#EDE9E3] hover:bg-[#2E2A26] transition-colors cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </header>

      {/* Drawer backdrop */}
      <div
        aria-hidden="true"
        onClick={() => onOpenChange(false)}
        className={`lg:hidden fixed inset-0 z-40 bg-[#1C1A17]/40 touch-none transition-opacity duration-200 motion-reduce:transition-none ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Ao abrir, a visibilidade muda na hora, para o foco entrar; ao fechar, espera o deslize. */}
      <aside
        id="admin-nav"
        aria-label="Menu do painel"
        className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] lg:sticky lg:top-0 lg:bottom-auto lg:z-auto lg:h-dvh lg:w-[244px] lg:max-w-none lg:translate-x-0 lg:visible shrink-0 overflow-y-auto overscroll-contain bg-[#1C1A17] p-[24px_16px] flex flex-col gap-7 select-none duration-200 ease-out motion-reduce:transition-none lg:transition-none ${
          open ? 'translate-x-0 visible transition-transform' : '-translate-x-full invisible transition-[transform,visibility]'
        }`}
      >
      {/* Brand */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-[3px] px-2.5">
          <Link href="/admin/posts" className="font-display text-[22px] text-[#FAF8F4] tracking-normal hover:opacity-90">
            davidev
          </Link>
          <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#7C736A]">
            Painel
          </span>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Fechar menu"
          className="lg:hidden w-11 h-11 -mt-2 inline-flex items-center justify-center rounded text-[#EDE9E3] hover:bg-[#2E2A26] transition-colors cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-[3px]">
        {navItems.map((item) => {
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className={`flex items-center gap-[11px] h-10 coarse:h-11 px-3 rounded text-[14px] transition-colors ${
                item.active
                  ? 'bg-[#2E2A26] text-[#FAF8F4] font-medium'
                  : 'text-[#A29A90] hover:text-[#FAF8F4] hover:bg-[#25221F]'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
              {item.badgePill !== undefined && (
                <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#A6482C] text-white font-mono text-[11px]">
                  {item.badgePill}
                </span>
              )}
              {item.badgePill === undefined && item.badge !== undefined && (
                <span
                  className={`ml-auto font-mono text-[11px] ${
                    item.active ? 'text-[#A29A90]' : 'text-[#7C736A]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="mt-auto flex flex-col gap-2.5 px-2.5">
        <div className="h-px bg-[#2E2A26]" />
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-full bg-[#3A342E] flex items-center justify-center text-[12px] font-semibold text-[#EDE9E3]">
            {user?.name?.[0] || 'D'}
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] text-[#EDE9E3] leading-tight">
              {user?.name || 'Davi'}
            </span>
            <button
              onClick={() => logout()}
              className="text-[12px] text-[#7C736A] hover:text-[#EDE9E3] text-left transition-colors cursor-pointer coarse:h-11 coarse:-mb-3 coarse:text-[13px]"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}
