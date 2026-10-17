'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/lib/admin-auth-context';
import { AdminSidebar } from './components/sidebar';

function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAdminAuth();
  const router = useRouter();

  const isLoginPage = pathname === '/admin/login';

  React.useEffect(() => {
    if (!isLoading && !user && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isLoading, user, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F0E9] flex items-center justify-center font-mono text-[13px] text-[#857D74]">
        Carregando painel...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-[#F4F0E9] text-[#1C1A17] font-sans antialiased">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-y-auto">
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
