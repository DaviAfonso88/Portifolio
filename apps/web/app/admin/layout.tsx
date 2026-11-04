'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth-context';
import { useMediaQuery } from '@/lib/use-media-query';
import { AdminSidebar } from './components/sidebar';

function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAdminAuth();
  const router = useRouter();
  const [navOpen, setNavOpen] = React.useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const isLoginPage = pathname === '/admin/login';

  React.useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isLoading, user, isLoginPage, router]);

  // A partir desta largura a barra lateral é fixa: a gaveta aberta deixaria o conteúdo inerte.
  React.useEffect(() => {
    if (isDesktop) {
      setNavOpen(false);
    }
  }, [isDesktop]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#F4F0E9] flex items-center justify-center font-mono text-[13px] text-[#857D74]">
        Carregando painel...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-dvh lg:flex bg-[#F4F0E9] text-[#1C1A17] font-sans antialiased">
      <AdminSidebar open={navOpen} onOpenChange={setNavOpen} />
      <div className="lg:flex-1 min-w-0" inert={navOpen}>
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminProtectedLayout>{children}</AdminProtectedLayout>
    </AdminAuthProvider>
  );
}
