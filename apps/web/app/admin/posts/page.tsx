'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/admin-auth-context';

interface AdminPostItem {
  id: string;
  locale: 'pt-BR' | 'en';
  slug: string;
  title: string;
  excerpt: string;
  categoryName: string;
  categorySlug: string;
  status: 'PUBLISHED' | 'DRAFT' | 'TRASH';
  publishedAt: string | null;
  updatedAt: string;
  currentVersion: number;
}

interface PostsApiResponse {
  posts: AdminPostItem[];
  total: number;
  publishedCount: number;
  draftCount: number;
  trashCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminPostsPage() {
  const { authFetch } = useAdminAuth();

  const [posts, setPosts] = useState<AdminPostItem[]>([]);
  const [stats, setStats] = useState({ total: 0, publishedCount: 0, draftCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [localeFilter, setLocaleFilter] = useState<'pt-BR' | 'en'>('pt-BR');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Active dropdown
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }
      params.set('locale', localeFilter);
      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await authFetch(`/api/v1/admin/posts?${params.toString()}`);
      if (res.ok) {
        const data: PostsApiResponse = await res.json();
        setPosts(data.posts || []);
        setStats({
          total: data.total || 0,
          publishedCount: data.publishedCount || 0,
          draftCount: data.draftCount || 0,
        });
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // Keep existing list on failure
    } finally {
      setLoading(false);
    }
  }, [authFetch, statusFilter, localeFilter, searchQuery, currentPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleTrashPost = async (id: string) => {
    if (!confirm('Deseja mover este artigo para a lixeira?')) return;
    try {
      const res = await authFetch(`/api/v1/admin/posts/${id}/trash`, { method: 'PATCH' });
      if (res.ok) {
        fetchPosts();
      }
    } catch {
      alert('Erro ao mover artigo para a lixeira.');
    }
  };

  const handleUnpublishPost = async (id: string) => {
    try {
      const res = await authFetch(`/api/v1/admin/posts/${id}/unpublish`, { method: 'PATCH' });
      if (res.ok) {
        fetchPosts();
      }
    } catch {
      alert('Erro ao despublicar artigo.');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
  };

  return (
    <main className="p-7 md:p-[28px_36px_48px] flex flex-col gap-6 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-[25px] font-semibold text-[#1C1A17] m-0">Artigos</h1>
          <span className="text-[13.5px] text-[#857D74]">
            {stats.total} artigos · {stats.publishedCount} publicados · {stats.draftCount} rascunhos
          </span>
        </div>
        <Link
          href="/admin/posts/editor"
          className="inline-flex items-center gap-2 h-[42px] px-[18px] bg-[#1C1A17] hover:bg-[#2E2A26] text-[#FAF8F4] rounded text-[14px] font-medium transition-colors cursor-pointer"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Novo artigo
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex items-center flex-1 min-w-[260px] max-w-[380px]">
          <span className="absolute left-3.5 flex text-[#A29A90] pointer-events-none">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L21 21" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar por título"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pl-10 pr-3.5 border border-[#DDD6CB] rounded bg-white text-[14px] text-[#1C1A17] outline-none focus:border-[#1C1A17]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex gap-[5px] bg-[#EBE6DE] rounded p-[3px]">
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setCurrentPage(1);
            }}
            className={`h-[34px] inline-flex items-center px-4 rounded text-[13.5px] transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                : 'text-[#55504A] hover:text-[#1C1A17]'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => {
              setStatusFilter('PUBLISHED');
              setCurrentPage(1);
            }}
            className={`h-[34px] inline-flex items-center px-4 rounded text-[13.5px] transition-colors ${
              statusFilter === 'PUBLISHED'
                ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                : 'text-[#55504A] hover:text-[#1C1A17]'
            }`}
          >
            Publicados
          </button>
          <button
            onClick={() => {
              setStatusFilter('DRAFT');
              setCurrentPage(1);
            }}
            className={`h-[34px] inline-flex items-center px-4 rounded text-[13.5px] transition-colors ${
              statusFilter === 'DRAFT'
                ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                : 'text-[#55504A] hover:text-[#1C1A17]'
            }`}
          >
            Rascunhos
          </button>
        </div>

        {/* Locale Pills */}
        <div className="flex gap-[5px] bg-[#EBE6DE] rounded p-[3px]">
          <button
            onClick={() => {
              setLocaleFilter('pt-BR');
              setCurrentPage(1);
            }}
            className={`h-[34px] inline-flex items-center px-3.5 rounded font-mono text-[12px] transition-colors ${
              localeFilter === 'pt-BR'
                ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                : 'text-[#55504A] hover:text-[#1C1A17]'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => {
              setLocaleFilter('en');
              setCurrentPage(1);
            }}
            className={`h-[34px] inline-flex items-center px-3.5 rounded font-mono text-[12px] transition-colors ${
              localeFilter === 'en'
                ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                : 'text-[#55504A] hover:text-[#1C1A17]'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4DFD7] rounded-lg overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1fr_130px_140px_120px_120px_44px] gap-4 p-[13px_20px] bg-[#FAF8F4] border-b border-[#E4DFD7] font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
          <span>Título</span>
          <span>Status</span>
          <span>Categoria</span>
          <span>Publicado</span>
          <span>Atualizado</span>
          <span></span>
        </div>

        {/* Rows */}
        {loading && (
          <div className="p-12 text-center font-mono text-[13px] text-[#857D74]">
            Carregando artigos...
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="p-12 text-center text-[14px] text-[#857D74]">
            Nenhum artigo encontrado com os filtros atuais.
          </div>
        )}

        {!loading &&
          posts.map((post, index) => {
            const isAlternate = index % 2 === 1;
            const isPublished = post.status === 'PUBLISHED';
            const isTrash = post.status === 'TRASH';

            return (
              <div
                key={post.id}
                className={`grid grid-cols-1 md:grid-cols-[1fr_130px_140px_120px_120px_44px] gap-3 md:gap-4 p-4 md:p-[16px_20px] border-b border-[#F0ECE4] items-center ${
                  isAlternate ? 'bg-[#FBFAF7]' : 'bg-white'
                }`}
              >
                {/* Title & Slug */}
                <div className="flex flex-col gap-1 min-w-0">
                  <Link
                    href={`/admin/posts/editor?id=${post.id}`}
                    className="text-[15px] font-medium text-[#1C1A17] hover:text-[#A6482C] transition-colors truncate"
                  >
                    {post.title}
                  </Link>
                  <span className="font-mono text-[11px] text-[#A29A90] truncate">
                    {post.slug ? `/blog/${post.slug}` : 'sem slug definido'}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5 text-[13px]">
                  {isPublished && (
                    <span className="inline-flex items-center gap-1.5 text-[#1F5E5B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F5E5B]" />
                      Publicado
                    </span>
                  )}
                  {!isPublished && !isTrash && (
                    <span className="inline-flex items-center gap-1.5 text-[#857D74]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C4BCB1]" />
                      Rascunho
                    </span>
                  )}
                  {isTrash && (
                    <span className="inline-flex items-center gap-1.5 text-[#B5442B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B5442B]" />
                      Lixeira
                    </span>
                  )}
                </div>

                {/* Category */}
                <span className="text-[13.5px] text-[#55504A] truncate">
                  {post.categoryName || '—'}
                </span>

                {/* Published Date */}
                <span className="font-mono text-[12.5px] text-[#55504A]">
                  {formatDate(post.publishedAt)}
                </span>

                {/* Updated Date */}
                <span className="font-mono text-[12.5px] text-[#55504A]">
                  {formatDate(post.updatedAt)}
                </span>

                {/* Actions Dropdown */}
                <div className="relative flex justify-end">
                  <button
                    onClick={() =>
                      setOpenDropdownId(openDropdownId === post.id ? null : post.id)
                    }
                    aria-label="Ações do artigo"
                    className="w-[30px] h-[30px] inline-flex items-center justify-center rounded text-[#857D74] hover:text-[#1C1A17] hover:bg-[#F0ECE4] transition-colors cursor-pointer"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>

                  {openDropdownId === post.id && (
                    <div className="absolute right-0 top-8 z-20 w-44 bg-white border border-[#E4DFD7] rounded-md shadow-lg py-1 flex flex-col font-sans text-[13px]">
                      <Link
                        href={`/admin/posts/editor?id=${post.id}`}
                        className="px-3.5 py-2 text-[#38332E] hover:bg-[#FAF8F4] text-left"
                      >
                        Editar
                      </Link>
                      {isPublished && (
                        <button
                          onClick={() => {
                            setOpenDropdownId(null);
                            handleUnpublishPost(post.id);
                          }}
                          className="px-3.5 py-2 text-[#38332E] hover:bg-[#FAF8F4] text-left"
                        >
                          Despublicar
                        </button>
                      )}
                      {!isTrash && (
                        <button
                          onClick={() => {
                            setOpenDropdownId(null);
                            handleTrashPost(post.id);
                          }}
                          className="px-3.5 py-2 text-[#B5442B] hover:bg-[#FDF6F4] text-left"
                        >
                          Mover para lixeira
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between gap-5 flex-wrap">
        <span className="font-mono text-[12px] text-[#857D74]">
          Mostrando {posts.length > 0 ? (currentPage - 1) * 10 + 1 : 0}–
          {Math.min(currentPage * 10, stats.total)} de {stats.total}
        </span>
        <div className="flex gap-1.5 items-center">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="w-[34px] h-[34px] inline-flex items-center justify-center border border-[#E9E4DB] rounded text-[#C4BCB1] disabled:opacity-40 hover:text-[#1C1A17] transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-[34px] h-[34px] inline-flex items-center justify-center rounded text-[13.5px] transition-colors ${
                currentPage === page
                  ? 'bg-[#1C1A17] text-[#FAF8F4] font-medium'
                  : 'border border-[#DDD6CB] bg-white text-[#55504A] hover:bg-[#FAF8F4]'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="w-[34px] h-[34px] inline-flex items-center justify-center border border-[#DDD6CB] rounded bg-white text-[#55504A] disabled:opacity-40 hover:bg-[#FAF8F4] transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
