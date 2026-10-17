'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { registerPageView } from '@/lib/analytics';

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      registerPageView(pathname, typeof document !== 'undefined' ? document.referrer : '', searchParams);
    }
  }, [pathname, searchParams]);

  return null;
}
