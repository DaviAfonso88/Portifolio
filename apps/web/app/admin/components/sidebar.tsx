'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout, authFetch } = useAdminAuth();

  const [stats, setStats] = useState<{
    postsCount: number;
    trashCount: number;
    unnotifiedMessages: number;
  }>({
    postsCount: 24,
    trashCount: 2,
    unnotifiedMessages: 1,
  });

  useEffect(() => {
    // Optionally fetch dynamic badge counts
    let active = true;
    async function loadStats() {
      try {
        const [postsRes, messagesRes] = await Promise.all([
          authFetch('/api/v1/admin/posts?limit=1'),
          authFetch('/api/v1/admin/contact-messages?limit=1'),
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
    <aside className="w-[244px] shrink-0 bg-[#1C1A17] p-[24px_16px] flex flex-col gap-7 select-none min-h-screen">
      {/* Brand */}
      <div className="flex flex-col gap-[3px] px-2.5">
        <Link href="/admin/posts" className="font-display text-[22px] text-[#FAF8F4] tracking-normal hover:opacity-90">
          davidev
        </Link>
        <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[#7C736A]">
          Painel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-[3px]">
        {navItems.map((item) => {
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-[11px] h-10 px-3 rounded text-[14px] transition-colors ${
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
              className="text-[12px] text-[#7C736A] hover:text-[#EDE9E3] text-left transition-colors cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
