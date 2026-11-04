'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAdminAuth } from '../../../../../lib/admin-auth-context';

export interface PostVersionSummaryItem {
  versionNumber: number;
  title: string;
  excerpt: string;
  createdAt: string;
}

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  currentVersion: number;
}

export function VersionHistoryDrawer({
  isOpen,
  onClose,
  postId,
  currentVersion,
}: VersionHistoryDrawerProps) {
  const { authFetch } = useAdminAuth();
  const [versions, setVersions] = useState<PostVersionSummaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await authFetch(`/api/v1/admin/posts/${postId}/versions?pageSize=50`);
      if (!res.ok) {
        throw new Error('Não foi possível carregar as versões do artigo.');
      }
      const json = await res.json();
      setVersions(json.data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [authFetch, postId]);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, fetchVersions]);

  // Keyboard accessibility: Escape key closes drawer
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="version-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1C1A17]/40 backdrop-blur-xs transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E4DFD7] flex items-center justify-between bg-[#FDFCFA]">
            <div>
              <h2
                id="version-drawer-title"
                className="text-[17px] font-semibold text-[#1C1A17] m-0"
              >
                Histórico de Versões
              </h2>
              <p className="text-[12.5px] text-[#857D74] mt-0.5 m-0 font-mono">
                Artigo com {versions.length} {versions.length === 1 ? 'versão registrada' : 'versões registradas'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar histórico"
              className="w-8 h-8 coarse:w-11 coarse:h-11 rounded-md flex items-center justify-center text-[#857D74] hover:text-[#1C1A17] hover:bg-[#F2EFE9] transition-colors cursor-pointer shrink-0"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#857D74]">
                <div className="w-6 h-6 border-2 border-[#1C1A17] border-t-transparent rounded-full animate-spin" />
                <span className="font-mono text-[12px]">Carregando histórico...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-[#FBEBE8] border border-[#F2C2B8] rounded-md flex flex-col gap-2">
                <span className="text-[13px] text-[#A6482C] font-medium">{error}</span>
                <button
                  type="button"
                  onClick={fetchVersions}
                  className="self-start text-[12px] font-mono text-[#A6482C] underline hover:no-underline cursor-pointer"
                >
                  Tentar novamente
                </button>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-16 text-[#857D74] flex flex-col gap-2">
                <p className="text-[14px]">Nenhuma versão registrada ainda.</p>
                <p className="text-[12px] text-[#A29A90]">
                  Versões são criadas automaticamente sob alterações textuais pós-publicação.
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-[#E4DFD7] ml-3.5 pl-6 flex flex-col gap-6">
                {versions.map((ver) => {
                  const isCurrent = ver.versionNumber === currentVersion;
                  const formattedDate = new Date(ver.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={ver.versionNumber} className="relative flex flex-col gap-1.5 group">
                      {/* Timeline dot */}
                      <span
                        className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border-2 bg-white transition-colors ${
                          isCurrent
                            ? 'border-[#1C1A17] bg-[#1C1A17]'
                            : 'border-[#A29A90] group-hover:border-[#1C1A17]'
                        }`}
                      />

                      {/* Header row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[12px] font-medium px-2 py-0.5 rounded ${
                              isCurrent
                                ? 'bg-[#1C1A17] text-[#FAF8F4]'
                                : 'bg-[#EBE6DE] text-[#38332E]'
                            }`}
                          >
                            v{ver.versionNumber}
                          </span>
                          {isCurrent && (
                            <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#1C1A17] font-semibold bg-[#EBE6DE] px-1.5 py-0.5 rounded">
                              Atual
                            </span>
                          )}
                        </div>

                        <span className="font-mono text-[11px] text-[#857D74]">
                          {formattedDate}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-[14px] font-medium text-[#1C1A17] m-0 leading-snug">
                        {ver.title}
                      </h4>

                      {/* Excerpt */}
                      {ver.excerpt && (
                        <p className="text-[12.5px] text-[#55504A] m-0 line-clamp-3 leading-relaxed">
                          {ver.excerpt}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer note matching BR-005 specification */}
          <div className="p-4 border-t border-[#E4DFD7] bg-[#FAF8F4] text-[11.5px] text-[#857D74] flex items-center justify-between font-mono">
            <span>Regra BR-005 · Hash SHA-256</span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#1C1A17] hover:underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
