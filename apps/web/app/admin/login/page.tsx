'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/admin-auth-context';

export default function AdminLoginPage() {
  const { user, login } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState('davi@davidev.net.br');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/admin/posts');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push('/admin/posts');
    } else {
      setErrorMessage(result.error || 'E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0E9] text-[#1C1A17] flex items-center justify-center p-6 sm:p-12 font-sans antialiased">
      <div className="w-full max-w-[420px] flex flex-col gap-[26px]">
        {/* Header */}
        <div className="flex flex-col gap-2.5 items-center text-center">
          <span className="font-display text-[28px] text-[#1C1A17]">davidev</span>
          <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#857D74]">
            Painel administrativo
          </span>
        </div>

        {/* Card Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E4DFD7] rounded-lg p-[34px] flex flex-col gap-5 shadow-sm"
        >
          {/* Email */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[14px] font-medium text-[#38332E]" htmlFor="admin-email">
              E-mail
            </label>
            <input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[46px] px-3.5 border border-[#D9D2C8] rounded bg-white text-[15px] coarse:text-[16px] text-[#1C1A17] outline-none focus:border-[#1C1A17] transition-colors"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-[7px]">
            <label className="text-[14px] font-medium text-[#38332E]" htmlFor="admin-password">
              Senha
            </label>
            <div className="relative flex items-center">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[46px] pl-3.5 pr-11 border border-[#D9D2C8] rounded bg-white text-[15px] coarse:text-[16px] text-[#1C1A17] outline-none focus:border-[#1C1A17] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                className="absolute right-3.5 flex text-[#857D74] hover:text-[#1C1A17] transition-colors"
              >
                {showPassword ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-[11px] bg-[#FDF6F4] border border-[#EFD8D1] rounded p-[13px_15px]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#B5442B"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="shrink-0 mt-0.5"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v6M12 16h.01" />
              </svg>
              <span className="text-[13.5px] leading-[1.55] text-[#8C3721]">
                {errorMessage}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 bg-[#1C1A17] hover:bg-[#2E2A26] disabled:opacity-70 text-[#FAF8F4] rounded text-[15px] font-medium transition-colors cursor-pointer flex items-center justify-center"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Footer info */}
        <div className="flex flex-col gap-2.5 items-center">
          <span className="font-mono text-[11px] text-[#A29A90] text-center leading-[1.7]">
            Área restrita ao administrador.
            <br />
            Tentativas são limitadas a 5 a cada 15 minutos.
          </span>
          <Link
            href="/"
            className="text-[13px] text-[#857D74] hover:text-[#7E351F] hover:underline transition-colors"
          >
            ← Voltar ao site
          </Link>
        </div>
      </div>
    </div>
  );
}
