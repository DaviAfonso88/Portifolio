'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PostStatus } from '@davidev/domain';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { AdminDialog } from '../../components/admin-dialog';

interface TrashPostItem {
  id: string;
  title: string;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  currentVersion: number;
  historicalSlugs?: string[];
}

export default function AdminTrashPage() {
  const { authFetch } = useAdminAuth();

  const [posts, setPosts] = useState<TrashPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<TrashPostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/api/v1/admin/posts?status=${PostStatus.TRASH}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (id: string, thenUnpublish = false) => {
    try {
      const res = await authFetch(`/api/v1/admin/posts/${id}/restore`, { method: 'PATCH' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || err.error || 'Erro ao restaurar artigo da lixeira.');
        return;
      }

      if (thenUnpublish) {
        await authFetch(`/api/v1/admin/posts/${id}/unpublish`, { method: 'PATCH' });
      }

      setPostToDelete(null);
      fetchTrash();
    } catch {
      alert('Falha na comunicação com o servidor.');
    }
  };

  const handlePermanentDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`/api/v1/admin/posts/${postToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setPostToDelete(null);
        fetchTrash();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || err.error || 'Erro ao excluir definitivamente.');
      }
    } catch {
      alert('Falha ao excluir o artigo.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <main className="p-4 sm:p-7 lg:p-[28px_36px_48px] flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[25px] font-semibold text-[#1C1A17] m-0">Lixeira</h1>
        <span className="text-[13.5px] text-[#857D74]">
          Artigos retirados do ar. Podem ser restaurados a qualquer momento.
        </span>
      </div>

      {/* Warning Alert Banner */}
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
          A exclusão definitiva remove o artigo{' '}
          <strong className="font-semibold">fisicamente do banco</strong>, com todo o histórico de
          versões e os redirecionamentos de endereço. Não existe recuperação depois disso.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4DFD7] rounded-lg overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="hidden xl:grid grid-cols-[minmax(0,1fr)_150px_160px_296px] gap-4 p-[13px_20px] bg-[#FAF8F4] border-b border-[#E4DFD7] font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
          <span>Título</span>
          <span>Estava como</span>
          <span>Enviado à lixeira</span>
          <span></span>
        </div>

        {loading && (
          <div className="p-12 text-center font-mono text-[13px] text-[#857D74]">
            Carregando itens da lixeira...
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="p-12 text-center text-[14px] text-[#857D74]">
            A lixeira está vazia.
          </div>
        )}

        {!loading &&
          posts.map((post, idx) => {
            const isAlternate = idx % 2 === 1;
            const wasPublished = Boolean(post.publishedAt);
            const historicalCount = post.historicalSlugs?.length || 0;

            return (
              <div
                key={post.id}
                className={`grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_150px_160px_296px] gap-3 xl:gap-4 p-4 xl:p-[16px_20px] border-b border-[#F0ECE4] last:border-b-0 items-center ${
                  isAlternate ? 'bg-[#FBFAF7]' : 'bg-white'
                }`}
              >
                {/* Title & info */}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[15px] font-medium text-[#1C1A17] break-words">{post.title}</span>
                  <span className="font-mono text-[11px] text-[#A29A90]">
                    {post.currentVersion} {post.currentVersion === 1 ? 'versão' : 'versões'}
                    {historicalCount > 0 ? ` · ${historicalCount} slug histórico` : ''}
                  </span>
                </div>

                {/* Abaixo de xl, uma linha sob o título; a partir de xl, cada item é uma coluna. */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 xl:contents">
                {/* Status before trash */}
                <div>
                  {wasPublished ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#1F5E5B]">
                      <span className="w-[7px] h-[7px] rounded-full bg-[#1F5E5B]" />
                      Publicado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#857D74]">
                      <span className="w-[7px] h-[7px] rounded-full bg-[#C4BCB1]" />
                      Rascunho
                    </span>
                  )}
                </div>

                {/* Sent to trash date */}
                <span className="font-mono text-[12.5px] text-[#55504A]">
                  <span className="xl:hidden">na lixeira desde </span>
                  {formatDate(post.updatedAt)}
                </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 xl:flex-nowrap xl:justify-end">
                  <button
                    onClick={() => handleRestore(post.id)}
                    className="grow xl:grow-0 h-[34px] coarse:h-11 px-3.5 border border-[#DDD6CB] rounded bg-white text-[#38332E] hover:bg-[#FAF8F4] text-[13.5px] transition-colors cursor-pointer"
                  >
                    Restaurar
                  </button>
                  <button
                    onClick={() => setPostToDelete(post)}
                    className="grow xl:grow-0 h-[34px] coarse:h-11 px-3.5 border border-[#E7C9BF] rounded bg-[#FDF6F4] text-[#B5442B] hover:bg-[#FBEBE7] text-[13.5px] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Excluir definitivamente
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Confirmation Modal */}
      {postToDelete && (
        <AdminDialog
          labelledBy="delete-post-title"
          onClose={() => setPostToDelete(null)}
          className="max-w-[540px]"
        >
            <div className="p-5 sm:p-8 sm:pb-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-full bg-[#FDF0EC] flex items-center justify-center shrink-0">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#B5442B"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  >
                    <path d="M12 4l9 16H3z" />
                    <path d="M12 10v4M12 17h.01" />
                  </svg>
                </div>
                <h2 id="delete-post-title" className="text-[20px] font-semibold text-[#1C1A17] m-0">
                  Excluir definitivamente?
                </h2>
              </div>

              <p className="m-0 text-[15px] leading-[1.7] text-[#38332E]">
                Excluir definitivamente remove o artigo, todo o seu histórico de versões e os
                redirecionamentos do endereço antigo.{' '}
                <strong className="font-semibold text-[#1C1A17]">
                  Esta ação não pode ser desfeita.
                </strong>{' '}
                Se você só quer tirar o artigo do ar, use “Restaurar e despublicar”.
              </p>

              <div className="bg-[#FAF8F4] border border-[#E4DFD7] rounded p-3.5 flex flex-col gap-1">
                <span className="text-[14px] font-medium text-[#1C1A17] break-words">
                  {postToDelete.title}
                </span>
                <span className="font-mono text-[11.5px] text-[#857D74]">
                  {postToDelete.currentVersion} versões · {postToDelete.historicalSlugs?.length || 0}{' '}
                  slugs históricos serão removidos junto
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center sm:justify-end gap-2.5 p-4 sm:p-[18px_32px] bg-[#FAF8F4] border-t border-[#E4DFD7]">
              <button
                onClick={() => setPostToDelete(null)}
                className="h-[42px] px-4 border border-[#DDD6CB] rounded bg-white text-[#38332E] hover:bg-[#FAF8F4] text-[14px] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRestore(postToDelete.id, true)}
                className="h-[42px] px-4 border border-[#DDD6CB] rounded bg-white text-[#38332E] hover:bg-[#FAF8F4] text-[14px] transition-colors cursor-pointer"
              >
                Restaurar e despublicar
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={isDeleting}
                className="h-[42px] px-5 rounded bg-[#B5442B] hover:bg-[#9E3922] disabled:opacity-70 text-white text-[14px] font-medium transition-colors cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Excluir definitivamente'}
              </button>
            </div>
        </AdminDialog>
      )}
    </main>
  );
}
