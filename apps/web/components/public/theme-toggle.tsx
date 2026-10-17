'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  ariaLabel?: string;
}

export function ThemeToggle({ ariaLabel = 'Alternar tema claro/escuro' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      className="size-[34px] flex items-center justify-center rounded-[4px] border border-rule bg-transparent text-ink-2 hover:text-ink hover:border-ink-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {mounted && resolvedTheme === 'dark' ? (
        <Sun className="size-[17px] stroke-[1.5]" />
      ) : (
        <Moon className="size-[17px] stroke-[1.5]" />
      )}
    </button>
  );
}
