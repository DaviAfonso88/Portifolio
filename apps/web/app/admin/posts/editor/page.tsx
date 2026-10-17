'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth-context';
import { ArticleRenderer } from '@/components/blog/article-renderer';
import { VersionHistoryDrawer } from './components/version-history-drawer';

interface CategoryItem {
  id: string;
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
}

interface TagItem {
  id: string;
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
}

function EditorContent() {
  const { authFetch } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');

  // View mode
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [locale, setLocale] = useState<'pt-BR' | 'en'>('pt-BR');
  const [excerpt, setExcerpt] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT' | 'TRASH'>('DRAFT');
  const [version, setVersion] = useState(1);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  // Meta data
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [availableTagDropdownOpen, setAvailableTagDropdownOpen] = useState(false);

  // Status & loading
  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSlugRedirectModal, setShowSlugRedirectModal] = useState(false);
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load taxonomies
  useEffect(() => {
    async function loadTaxonomies() {
      try {
        const [catsRes, tagsRes] = await Promise.all([
          authFetch('/api/v1/admin/categories'),
          authFetch('/api/v1/admin/tags'),
        ]);
        if (catsRes.ok) {
          const catData = await catsRes.json();
          setCategories(catData.categories || []);
          if (!categoryId && catData.categories?.length > 0) {
            setCategoryId(catData.categories[0].id);
          }
        }
        if (tagsRes.ok) {
          const tagData = await tagsRes.json();
          setTags(tagData.tags || []);
        }
      } catch {
        // Ignore
      }
    }
    loadTaxonomies();
  }, [authFetch, categoryId]);

  // Load post if editing
  useEffect(() => {
    if (!postId) return;
    async function loadPost() {
      setLoading(true);
      try {
        const res = await authFetch(`/api/v1/admin/posts/${postId}`);
        if (res.ok) {
          const post = await res.json();
          setTitle(post.title || '');
          setSlug(post.slug || '');
          setOriginalSlug(post.slug || '');
          setLocale(post.locale || 'pt-BR');
          setExcerpt(post.excerpt || '');
          setMarkdown(post.content || '');
          setCoverImageUrl(post.coverImageUrl || '');
          setCategoryId(post.categoryId || '');
          setSelectedTagIds(post.tagIds || []);
          setStatus(post.status || 'DRAFT');
          setVersion(post.currentVersion || 1);
          setPublishedAt(post.publishedAt || null);
          setHasUnsavedChanges(false);
        }
      } catch {
        alert('Erro ao carregar artigo.');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId, authFetch]);

  // Word count and reading time
  const wordsCount = markdown.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordsCount / 200));

  // Toolbar formatting helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = `${prefix}${selectedText || 'texto'}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    setMarkdown(newText);
    setHasUnsavedChanges(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 5)
      );
    }, 0);
  };

  const handleSave = async (publish: boolean = false) => {
    // Check if slug changed on published post and needs confirmation
    if (status === 'PUBLISHED' && slug !== originalSlug && !showSlugRedirectModal) {
      setShowSlugRedirectModal(true);
      return;
    }

    setSaving(true);
    try {
      if (!postId) {
        // Create new post
        const res = await authFetch('/api/v1/admin/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            slug,
            locale,
            excerpt,
            content: markdown,
            coverImageUrl: coverImageUrl || null,
            categoryId,
            tagIds: selectedTagIds,
            publish,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.message || 'Erro ao criar artigo.');
          setSaving(false);
          return;
        }

        const data = await res.json();
        setHasUnsavedChanges(false);
        router.push(`/admin/posts/editor?id=${data.post.id}`);
      } else {
        // Update existing post
        const res = await authFetch(`/api/v1/admin/posts/${postId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            slug,
            locale,
            excerpt,
            content: markdown,
            coverImageUrl: coverImageUrl || null,
            categoryId,
            tagIds: selectedTagIds,
            publish,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.message || 'Erro ao salvar artigo.');
          setSaving(false);
          return;
        }

        const data = await res.json();
        setVersion(data.post.currentVersion);
        setStatus(data.post.status);
        setOriginalSlug(data.post.slug);
        setHasUnsavedChanges(false);
        setShowSlugRedirectModal(false);
      }
    } catch {
      alert('Falha ao comunicar com o servidor.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (id: string) => {
    if (selectedTagIds.includes(id)) {
      setSelectedTagIds(selectedTagIds.filter((t) => t !== id));
      setHasUnsavedChanges(true);
    } else {
      if (selectedTagIds.length >= 10) {
        alert('Limite máximo de 10 tags por artigo atingido (BR-010).');
        return;
      }
      setSelectedTagIds([...selectedTagIds, id]);
      setHasUnsavedChanges(true);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center font-mono text-[13px] text-[#857D74]">
        Carregando editor...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col min-w-0 bg-white font-sans overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-5 p-[14px_24px] bg-white border-b border-[#E4DFD7] shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href="/admin/posts"
            className="flex items-center justify-center w-[34px] h-[34px] border border-[#DDD6CB] rounded text-[#55504A] hover:bg-[#FAF8F4] shrink-0 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </Link>

          <div className="flex flex-col gap-0.5 min-w-0">
            <input
              type="text"
              value={title}
              placeholder="Título do artigo"
              onChange={(e) => {
                setTitle(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="text-[15px] font-semibold text-[#1C1A17] bg-transparent outline-none border-b border-transparent focus:border-[#DDD6CB] truncate pr-2"
            />
            <div className="flex items-center gap-2.5 text-[12px]">
              {status === 'PUBLISHED' ? (
                <span className="inline-flex items-center gap-1.5 text-[#1F5E5B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F5E5B]" />
                  Publicado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[#857D74]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4BCB1]" />
                  Rascunho
                </span>
              )}
              {hasUnsavedChanges && (
                <>
                  <span className="text-[#DDD6CB]">·</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-[#A6482C]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A6482C]" />
                    Alterações não salvas
                  </span>
                </>
              )}
              <span className="text-[#DDD6CB]">·</span>
              <span className="font-mono text-[11.5px] text-[#A29A90]">v{version}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* View mode switcher */}
          <div className="flex gap-[3px] bg-[#EBE6DE] rounded p-[3px]">
            <button
              onClick={() => setViewMode('editor')}
              className={`h-8 px-3 rounded text-[13px] transition-colors ${
                viewMode === 'editor'
                  ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                  : 'text-[#55504A] hover:text-[#1C1A17]'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`h-8 px-3 rounded text-[13px] transition-colors ${
                viewMode === 'preview'
                  ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                  : 'text-[#55504A] hover:text-[#1C1A17]'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`h-8 px-3 rounded text-[13px] transition-colors ${
                viewMode === 'split'
                  ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                  : 'text-[#55504A] hover:text-[#1C1A17]'
              }`}
            >
              Split
            </button>
          </div>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="h-[38px] px-4 border border-[#DDD6CB] rounded bg-white text-[#38332E] hover:bg-[#FAF8F4] text-[14px] transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="h-[38px] px-4 rounded bg-[#1C1A17] hover:bg-[#2E2A26] text-[#FAF8F4] text-[14px] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {status === 'PUBLISHED' ? 'Atualizar publicação' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* Main 3-Column Body */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_1fr_304px] min-h-0 overflow-hidden">
        {/* Column 1: Markdown Editor */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div
            className={`flex flex-col border-r border-[#E4DFD7] bg-white min-w-0 ${
              viewMode === 'editor' ? 'col-span-2' : ''
            }`}
          >
            {/* Toolbar */}
            <div className="flex items-center gap-2.5 p-[9px_16px] border-b border-[#F0ECE4] bg-[#FAF8F4]">
              <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
                Markdown
              </span>
              <div className="ml-auto flex gap-1 items-center">
                <button
                  type="button"
                  onClick={() => insertFormatting('**', '**')}
                  title="Negrito (Bold)"
                  className="w-7 h-7 inline-flex items-center justify-center rounded text-[#857D74] hover:text-[#1C1A17] hover:bg-[#EBE6DE] font-mono text-[12px] font-semibold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*', '*')}
                  title="Itálico"
                  className="w-7 h-7 inline-flex items-center justify-center rounded text-[#857D74] hover:text-[#1C1A17] hover:bg-[#EBE6DE] font-mono text-[12px] italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[', '](https://)')}
                  title="Link"
                  className="w-7 h-7 inline-flex items-center justify-center rounded text-[#857D74] hover:text-[#1C1A17] hover:bg-[#EBE6DE]"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
                    <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('```\n', '\n```')}
                  title="Código"
                  className="w-7 h-7 inline-flex items-center justify-center rounded text-[#857D74] hover:text-[#1C1A17] hover:bg-[#EBE6DE]"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('![imagem](', ')')}
                  title="Imagem"
                  className="w-7 h-7 inline-flex items-center justify-center rounded text-[#857D74] hover:text-[#1C1A17] hover:bg-[#EBE6DE]"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 5h18v14H3z" />
                    <circle cx="8.5" cy="10" r="1.5" />
                    <path d="M21 16l-5.5-5.5L7 19" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Markdown Textarea */}
            <textarea
              ref={textareaRef}
              value={markdown}
              placeholder="Escreva o artigo em Markdown aqui..."
              onChange={(e) => {
                setMarkdown(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="flex-1 p-5 md:p-[20px_22px] font-mono text-[13.5px] leading-[1.85] text-[#38332E] outline-none resize-none overflow-y-auto"
            />

            {/* Status Footer */}
            <div className="flex items-center justify-between gap-4 p-[8px_16px] border-t border-[#F0ECE4] bg-[#FAF8F4] font-mono text-[11px] text-[#A29A90] shrink-0">
              <span>
                {wordsCount} palavras · {readingTime} min
              </span>
              <span>Markdown</span>
            </div>
          </div>
        )}

        {/* Column 2: Live Article Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`flex flex-col border-r border-[#E4DFD7] bg-[#FAF8F4] min-w-0 ${
              viewMode === 'preview' ? 'col-span-2' : ''
            }`}
          >
            <div className="flex items-center gap-2.5 p-[9px_16px] border-b border-[#F0ECE4] bg-[#FAF8F4]">
              <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
                Preview
              </span>
              <span className="inline-flex items-center gap-1.5 ml-auto text-[11px] text-[#1F5E5B]">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 12l5 5L20 6" />
                </svg>
                mesmo componente da página pública
              </span>
            </div>

            <div className="flex-1 p-6 md:p-[26px_30px] overflow-y-auto">
              <ArticleRenderer content={markdown || '*O preview aparecerá aqui...*'} />
            </div>
          </div>
        )}

        {/* Column 3: Sidebar Settings Drawer */}
        <div className="bg-white border-l border-[#E4DFD7] p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Slug */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              placeholder="meu-artigo-slug"
              onChange={(e) => {
                setSlug(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="h-[38px] px-2.5 border border-[#DDD6CB] rounded font-mono text-[12.5px] text-[#1C1A17] outline-none focus:border-[#1C1A17]"
            />
            {status === 'PUBLISHED' && (
              <span className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-[#A6482C]">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  className="shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" />
                </svg>
                Alterar o endereço de um artigo publicado mantém o antigo redirecionando (BR-004).
              </span>
            )}
          </div>

          {/* Idioma */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
              Idioma
            </label>
            <div className="flex gap-1.5 bg-[#F4F0E9] rounded p-[3px]">
              <button
                type="button"
                onClick={() => {
                  setLocale('pt-BR');
                  setHasUnsavedChanges(true);
                }}
                className={`flex-1 h-8 rounded text-[13px] transition-colors ${
                  locale === 'pt-BR'
                    ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                    : 'text-[#55504A]'
                }`}
              >
                pt-BR
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocale('en');
                  setHasUnsavedChanges(true);
                }}
                className={`flex-1 h-8 rounded text-[13px] transition-colors ${
                  locale === 'en'
                    ? 'bg-white text-[#1C1A17] font-medium shadow-sm'
                    : 'text-[#55504A]'
                }`}
              >
                en
              </button>
            </div>
          </div>

          {/* Resumo (Excerpt) */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
              Resumo
            </label>
            <textarea
              maxLength={320}
              value={excerpt}
              placeholder="Resumo editorial do artigo..."
              onChange={(e) => {
                setExcerpt(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="min-h-[72px] p-2.5 border border-[#DDD6CB] rounded text-[13px] leading-relaxed text-[#1C1A17] outline-none focus:border-[#1C1A17] resize-y"
            />
            <span className="font-mono text-[11px] text-[#A29A90] text-right">
              {excerpt.length} / 320
            </span>
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="h-[38px] px-2.5 border border-[#DDD6CB] rounded bg-white text-[13.5px] text-[#1C1A17] outline-none focus:border-[#1C1A17]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {locale === 'pt-BR' ? c.namePtBr : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
                Tags <span className="text-[#A29A90]">{selectedTagIds.length} / 10</span>
              </label>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {selectedTagIds.map((tagId) => {
                const tagObj = tags.find((t) => t.id === tagId);
                const tagName =
                  (locale === 'pt-BR' ? tagObj?.namePtBr : tagObj?.nameEn) || tagId;
                return (
                  <span
                    key={tagId}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded bg-[#F9F1ED] border border-[#EBD9D1] text-[#A6482C] font-mono text-[11.5px]"
                  >
                    {tagName}
                    <button
                      type="button"
                      onClick={() => toggleTag(tagId)}
                      aria-label={`Remover tag ${tagName}`}
                      className="cursor-pointer hover:opacity-75"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </span>
                );
              })}

              <button
                type="button"
                onClick={() => setAvailableTagDropdownOpen(!availableTagDropdownOpen)}
                className="h-7 px-2.5 border border-dashed border-[#DDD6CB] rounded bg-transparent text-[#857D74] hover:text-[#1C1A17] font-mono text-[11.5px] cursor-pointer"
              >
                + tag
              </button>
            </div>

            {/* Tag Selection Popup */}
            {availableTagDropdownOpen && (
              <div className="bg-[#FAF8F4] border border-[#E4DFD7] rounded p-2.5 flex flex-wrap gap-1.5 mt-1 max-h-36 overflow-y-auto">
                {tags.map((t) => {
                  const isSelected = selectedTagIds.includes(t.id);
                  const tagName = locale === 'pt-BR' ? t.namePtBr : t.nameEn;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTag(t.id)}
                      className={`h-6 px-2 rounded font-mono text-[11px] transition-colors ${
                        isSelected
                          ? 'bg-[#1C1A17] text-white'
                          : 'bg-white border border-[#DDD6CB] text-[#55504A] hover:border-[#1C1A17]'
                      }`}
                    >
                      {tagName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cover image */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
              Imagem de capa
            </label>
            <input
              type="text"
              placeholder="https://... ou caminho relativo"
              value={coverImageUrl}
              onChange={(e) => {
                setCoverImageUrl(e.target.value);
                setHasUnsavedChanges(true);
              }}
              className="h-[38px] px-2.5 border border-[#DDD6CB] rounded text-[12.5px] text-[#1C1A17] outline-none focus:border-[#1C1A17]"
            />
            <div className="w-full aspect-video border border-dashed border-[#DDD6CB] rounded flex flex-col items-center justify-center gap-1.5 text-[#A29A90] bg-[#FBFAF7] overflow-hidden">
              {coverImageUrl ? (
                <img
                  src={coverImageUrl}
                  alt="Capa do artigo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 16l4-4 3 3 4-5 5 6" />
                    <path d="M3 5h18v14H3z" />
                  </svg>
                  <span className="text-[11.5px]">Pré-visualização da imagem</span>
                </>
              )}
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="mt-auto flex flex-col gap-2 border-t border-[#F0ECE4] pt-4">
            <div className="flex items-center justify-between text-[12.5px] text-[#857D74]">
              <span>Versão atual</span>
              <span className="font-mono text-[#1C1A17]">v{version}</span>
            </div>
            {publishedAt && (
              <div className="flex items-center justify-between text-[12.5px] text-[#857D74]">
                <span>Publicado em</span>
                <span className="font-mono text-[#1C1A17]">
                  {new Date(publishedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
            {postId && (
              <button
                type="button"
                onClick={() => setVersionDrawerOpen(true)}
                className="text-left text-[12.5px] text-[#A6482C] hover:text-[#8C3A21] underline decoration-[#A6482C]/30 hover:decoration-[#8C3A21] font-medium pt-1 cursor-pointer transition-colors"
              >
                Ver histórico de versões →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Slug Redirection (BR-004, AC-10.1) */}
      {showSlugRedirectModal && (
        <div className="fixed inset-0 z-50 bg-[#1C1A17]/40 flex items-center justify-center p-5">
          <div className="w-full max-w-[500px] bg-white rounded-lg shadow-2xl p-6 flex flex-col gap-4">
            <h3 className="text-[18px] font-semibold text-[#1C1A17] m-0">
              Confirmar alteração de endereço (Slug)
            </h3>
            <p className="text-[14px] leading-relaxed text-[#38332E] m-0">
              Você está alterando o slug de um artigo publicado de:
              <br />
              <strong className="font-mono text-[12.5px] text-[#A6482C]">/{originalSlug}</strong>
              <br />
              para:
              <br />
              <strong className="font-mono text-[12.5px] text-[#1F5E5B]">/{slug}</strong>
            </p>
            <p className="text-[13px] leading-relaxed text-[#857D74] m-0">
              O slug anterior será arquivado e continuará redirecionando (HTTP 301) para a nova
              URL, preservando SEO e links externos (BR-004).
            </p>
            <div className="flex justify-end gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => {
                  setSlug(originalSlug);
                  setShowSlugRedirectModal(false);
                }}
                className="h-9 px-4 border border-[#DDD6CB] rounded bg-white text-[#38332E] text-[13.5px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSave(status === 'PUBLISHED')}
                className="h-9 px-4 rounded bg-[#1C1A17] text-[#FAF8F4] text-[13.5px] font-medium"
              >
                Confirmar e atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Drawer (US-12, T05.02) */}
      {postId && (
        <VersionHistoryDrawer
          isOpen={versionDrawerOpen}
          onClose={() => setVersionDrawerOpen(false)}
          postId={postId}
          currentVersion={version}
        />
      )}
    </div>
  );
}

export default function AdminEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center font-mono text-[13px] text-[#857D74]">
          Carregando editor...
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
