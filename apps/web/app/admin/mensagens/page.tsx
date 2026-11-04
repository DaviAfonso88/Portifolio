'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';

interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  locale: string;
  emailNotifiedAt: string | null;
  createdAt: string;
}

interface MessagesApiResponse {
  messages: ContactMessageItem[];
  total: number;
  unnotifiedCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminMensagensPage() {
  const { authFetch } = useAdminAuth();

  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [unnotifiedCount, setUnnotifiedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  // Filters
  const [onlyUnnotified, setOnlyUnnotified] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const params = new URLSearchParams();
      if (onlyUnnotified) {
        params.set('unnotifiedOnly', 'true');
      }
      params.set('limit', '50');

      const res = await authFetch(`/api/v1/admin/messages?${params.toString()}`);
      if (!res.ok) {
        setLoadFailed(true);
        return;
      }

      const data: MessagesApiResponse = await res.json();
      setMessages(data.messages || []);
      setTotalCount(data.total || 0);
      setUnnotifiedCount(data.unnotifiedCount || 0);
      setSelectedMessageId((current) => current ?? data.messages?.[0]?.id ?? null);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [authFetch, onlyUnnotified]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const selectedMessage =
    messages.find((m) => m.id === selectedMessageId) || (messages.length > 0 ? messages[0] : null);

  const formatRelativeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return `hoje ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'ontem';
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const calculateRetentionExpunge = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + 24);
    return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
  };

  return (
    <main className="p-7 md:p-[28px_36px_40px] flex flex-col gap-5 font-sans min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-[25px] font-semibold text-[#1C1A17] m-0">Mensagens</h1>
          <span className="text-[13.5px] text-[#857D74]">
            {totalCount} mensagens · retenção de 24 meses
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-[5px] bg-[#EBE6DE] rounded p-[3px]">
          <button
            onClick={() => setOnlyUnnotified(false)}
            className={`h-[34px] inline-flex items-center px-4 rounded text-[13.5px] transition-colors ${
              !onlyUnnotified
                ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                : 'text-[#55504A] hover:text-[#1C1A17]'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setOnlyUnnotified(true)}
            className={`h-[34px] inline-flex items-center gap-1.5 px-4 rounded text-[13.5px] transition-colors ${
              onlyUnnotified
                ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                : 'text-[#55504A] hover:text-[#1C1A17]'
            }`}
          >
            Não notificadas
            {unnotifiedCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#A6482C] text-white font-mono text-[10.5px]">
                {unnotifiedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Warning Banner if unnotified messages exist */}
      {unnotifiedCount > 0 && (
        <div className="flex gap-3 bg-[#FDF6F4] border border-[#EFD8D1] rounded-md p-4">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B5442B"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="shrink-0 mt-0.5"
          >
            <path d="M12 4l9 16H3z" />
            <path d="M12 10v4M12 17h.01" />
          </svg>
          <p className="m-0 text-[13.5px] leading-[1.65] text-[#8C3721]">
            <strong className="font-semibold">
              {unnotifiedCount} {unnotifiedCount === 1 ? 'mensagem não foi notificada' : 'mensagens não foram notificadas'} por e-mail.
            </strong>{' '}
            A mensagem está salva e não se perdeu — apenas o aviso não chegou à sua caixa.
            Verifique o provedor de e-mail e reenvie.
          </p>
        </div>
      )}

      {/* 2-Columns Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 flex-1 min-h-[500px]">
        {/* Left Column: Messages List */}
        <div className="bg-white border border-[#E4DFD7] rounded-lg overflow-hidden flex flex-col shadow-sm">
          <div className="p-[13px_18px] bg-[#FAF8F4] border-b border-[#E4DFD7] font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
            Recebidas
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F0ECE4]">
            {loading && (
              <div className="p-8 text-center font-mono text-[12px] text-[#857D74]">
                Carregando mensagens...
              </div>
            )}

            {!loading && loadFailed && (
              <div role="alert" className="p-8 text-center text-[13.5px] text-[#B5442B]">
                Não foi possível carregar as mensagens. Recarregue a página para tentar de novo.
              </div>
            )}

            {!loading && !loadFailed && messages.length === 0 && (
              <div className="p-8 text-center text-[13.5px] text-[#857D74]">
                Nenhuma mensagem encontrada.
              </div>
            )}

            {!loading &&
              !loadFailed &&
              messages.map((item) => {
                const isSelected = selectedMessage?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMessageId(item.id)}
                    className={`w-full text-left p-[15px_18px] flex flex-col gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-l-[3px] border-l-[#A6482C] bg-[#FBFAF7]'
                        : 'hover:bg-[#FAF8F4]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[14.5px] ${isSelected ? 'font-semibold' : 'font-medium'} text-[#1C1A17]`}>
                          {item.name}
                        </span>
                        {!item.emailNotifiedAt && (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] tracking-wider uppercase text-[#B5442B] border border-[#EFD8D1] bg-[#FDF6F4] px-1.5 py-0.5 rounded">
                            não notificada
                          </span>
                        )}
                        {item.locale === 'en' && (
                          <span className="font-mono text-[10px] text-[#857D74] border border-[#E4DFD7] px-1.5 py-0.5 rounded">
                            EN
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-[#A29A90] shrink-0">
                        {formatRelativeDate(item.createdAt)}
                      </span>
                    </div>

                    <span className="text-[13px] text-[#55504A] leading-snug truncate">
                      {item.subject || 'Sem assunto'}
                    </span>

                    <span className="text-[12.5px] text-[#857D74] leading-snug truncate">
                      {item.message}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Right Column: Selected Message Detail */}
        {selectedMessage ? (
          <div className="bg-white border border-[#E4DFD7] rounded-lg p-6 sm:p-[28px_32px] flex flex-col gap-[22px] shadow-sm">
            {/* Top row */}
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[21px] font-semibold text-[#1C1A17] m-0">
                  {selectedMessage.subject || 'Sem assunto'}
                </h2>
                <div className="flex items-center gap-2.5 text-[13.5px] text-[#55504A]">
                  <span className="font-medium">{selectedMessage.name}</span>
                  <span className="text-[#DDD6CB]">·</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="font-mono text-[12.5px] text-[#A6482C] hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject || ''
                  )}`}
                  className="inline-flex items-center gap-2 h-[38px] px-4 bg-[#1C1A17] hover:bg-[#2E2A26] text-[#FAF8F4] rounded text-[14px] font-medium transition-colors"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18v12H3z" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  Responder por e-mail
                </a>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="flex gap-7 py-3.5 border-t border-b border-[#F0ECE4] font-mono text-[11.5px] flex-wrap">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-wider uppercase text-[#A29A90]">
                  Recebida
                </span>
                <span className="text-[#38332E]">{formatFullDate(selectedMessage.createdAt)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-wider uppercase text-[#A29A90]">Idioma</span>
                <span className="text-[#38332E]">{selectedMessage.locale}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-wider uppercase text-[#A29A90]">
                  Notificação
                </span>
                {selectedMessage.emailNotifiedAt ? (
                  <span className="text-[#1F5E5B]">enviada</span>
                ) : (
                  <span className="text-[#B5442B]">não enviada (erro)</span>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] tracking-wider uppercase text-[#A29A90]">
                  Expurgo em
                </span>
                <span className="text-[#38332E]">
                  {calculateRetentionExpunge(selectedMessage.createdAt)}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div className="text-[16px] leading-[1.8] text-[#2A2621] max-w-[66ch] whitespace-pre-wrap">
              {selectedMessage.message}
            </div>

            {/* Privacy Compliance Footer */}
            <div className="mt-auto flex items-center gap-2.5 bg-[#F9F7F2] border border-[#E9E4DB] rounded p-3 text-[12.5px] leading-relaxed text-[#55504A]">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#857D74"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="shrink-0"
              >
                <path d="M12 3l8 4v5c0 4.4-3.2 8.3-8 9-4.8-.7-8-4.6-8-9V7l8-4z" />
              </svg>
              <span>Nenhum IP ou identificador de navegador foi armazenado com esta mensagem.</span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E4DFD7] rounded-lg p-12 flex items-center justify-center text-[14px] text-[#857D74]">
            Selecione uma mensagem para visualizar.
          </div>
        )}
      </div>
    </main>
  );
}
