'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '@/lib/admin-auth-context';

interface AdminCategory {
  id: string;
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
  postCount: number;
}

interface AdminTag {
  id: string;
  namePtBr: string;
  nameEn: string;
  slugPtBr: string;
  slugEn: string;
  postCount: number;
}

export default function AdminTaxonomiaPage() {
  const { authFetch } = useAdminAuth();

  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Category Edit / Create Modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [catNamePtBr, setCatNamePtBr] = useState('');
  const [catNameEn, setCatNameEn] = useState('');

  // Tag Edit / Create State
  const [editingTag, setEditingTag] = useState<AdminTag | null>(null);
  const [tagNamePtBr, setTagNamePtBr] = useState('');
  const [tagNameEn, setTagNameEn] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catsRes, tagsRes] = await Promise.all([
        authFetch('/api/v1/admin/categories'),
        authFetch('/api/v1/admin/tags'),
      ]);
      if (catsRes.ok) {
        const catData = await catsRes.json();
        setCategories(catData.categories || []);
      }
      if (tagsRes.ok) {
        const tagData = await tagsRes.json();
        setTags(tagData.tags || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Category Handlers
  const handleOpenCategoryModal = (cat?: AdminCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCatNamePtBr(cat.namePtBr);
      setCatNameEn(cat.nameEn);
    } else {
      setEditingCategory(null);
      setCatNamePtBr('');
      setCatNameEn('');
    }
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await authFetch(`/api/v1/admin/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ namePtBr: catNamePtBr, nameEn: catNameEn }),
        });
        if (res.ok) {
          showToast(`Categoria “${catNamePtBr}” atualizada.`);
          setCategoryModalOpen(false);
          loadData();
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || err.error || 'Erro ao atualizar categoria.');
        }
      } else {
        const res = await authFetch('/api/v1/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ namePtBr: catNamePtBr, nameEn: catNameEn }),
        });
        if (res.ok) {
          showToast(`Categoria “${catNamePtBr}” criada.`);
          setCategoryModalOpen(false);
          loadData();
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || err.error || 'Erro ao criar categoria.');
        }
      }
    } catch {
      alert('Falha na comunicação.');
    }
  };

  const handleDeleteCategory = async (cat: AdminCategory) => {
    if (cat.postCount > 0) return;
    if (!confirm(`Deseja excluir a categoria “${cat.namePtBr}”?`)) return;

    try {
      const res = await authFetch(`/api/v1/admin/categories/${cat.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Categoria “${cat.namePtBr}” excluída.`);
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || err.error || 'Erro ao excluir categoria (BR-009).');
      }
    } catch {
      alert('Falha na comunicação.');
    }
  };

  // Tag Handlers
  const handleSelectTagForEdit = (tag: AdminTag) => {
    setIsCreatingTag(false);
    setEditingTag(tag);
    setTagNamePtBr(tag.namePtBr);
    setTagNameEn(tag.nameEn);
  };

  const handleStartCreateTag = () => {
    setEditingTag(null);
    setIsCreatingTag(true);
    setTagNamePtBr('');
    setTagNameEn('');
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        const res = await authFetch(`/api/v1/admin/tags/${editingTag.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ namePtBr: tagNamePtBr, nameEn: tagNameEn }),
        });
        if (res.ok) {
          showToast(`Tag “${tagNamePtBr}” atualizada.`);
          setEditingTag(null);
          loadData();
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || err.error || 'Erro ao atualizar tag.');
        }
      } else if (isCreatingTag) {
        const res = await authFetch('/api/v1/admin/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ namePtBr: tagNamePtBr, nameEn: tagNameEn }),
        });
        if (res.ok) {
          showToast(`Tag “${tagNamePtBr}” criada.`);
          setIsCreatingTag(false);
          loadData();
        } else {
          const err = await res.json().catch(() => ({}));
          alert(err.message || err.error || 'Erro ao criar tag.');
        }
      }
    } catch {
      alert('Falha na comunicação.');
    }
  };

  const handleDeleteTag = async (tag: AdminTag) => {
    if (tag.postCount > 0) return;
    if (!confirm(`Deseja excluir a tag “${tag.namePtBr}”?`)) return;

    try {
      const res = await authFetch(`/api/v1/admin/tags/${tag.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Tag “${tag.namePtBr}” excluída.`);
        setEditingTag(null);
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || err.error || 'Erro ao excluir tag (BR-009).');
      }
    } catch {
      alert('Falha na comunicação.');
    }
  };

  return (
    <main className="p-7 md:p-[28px_36px_48px] flex flex-col gap-6 font-sans">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[25px] font-semibold text-[#1C1A17] m-0">Categorias e tags</h1>
        <span className="text-[13.5px] text-[#857D74]">
          Cada item tem rótulo nos dois idiomas — o filtro público aponta para o mesmo conceito em
          pt-BR e en.
        </span>
      </div>

      {/* 2-Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Categorias */}
        <section className="flex flex-col gap-3.5 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[17px] font-semibold text-[#1C1A17] m-0">
              Categorias{' '}
              <span className="font-mono text-[13px] text-[#A29A90] font-normal">
                {categories.length}
              </span>
            </h2>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="inline-flex items-center gap-1.5 h-[34px] px-3.5 border border-[#DDD6CB] rounded bg-white text-[#38332E] hover:bg-[#FAF8F4] text-[13.5px] transition-colors cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nova
            </button>
          </div>

          <div className="bg-white border border-[#E4DFD7] rounded-lg overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_1fr_62px_72px] gap-3 p-[11px_18px] bg-[#FAF8F4] border-b border-[#E4DFD7] font-mono text-[10px] tracking-[0.1em] uppercase text-[#857D74]">
              <span>pt-BR</span>
              <span>en</span>
              <span className="text-right">Posts</span>
              <span></span>
            </div>

            {loading && (
              <div className="p-8 text-center font-mono text-[12px] text-[#857D74]">
                Carregando categorias...
              </div>
            )}

            {!loading &&
              categories.map((cat, idx) => {
                const isAlternate = idx % 2 === 1;
                const inUse = cat.postCount > 0;

                return (
                  <div
                    key={cat.id}
                    className={`grid grid-cols-[1fr_1fr_62px_72px] gap-3 p-[13px_18px] border-b border-[#F0ECE4] items-center text-[14px] ${
                      isAlternate ? 'bg-[#FBFAF7]' : 'bg-white'
                    }`}
                  >
                    <span className="font-medium text-[#1C1A17] truncate">{cat.namePtBr}</span>
                    <span className="text-[#55504A] truncate">{cat.nameEn}</span>
                    <span
                      className={`font-mono text-[12.5px] text-right ${
                        cat.postCount > 0 ? 'text-[#55504A]' : 'text-[#A29A90]'
                      }`}
                    >
                      {cat.postCount}
                    </span>
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleOpenCategoryModal(cat)}
                        title="Editar categoria"
                        className="w-7 h-7 inline-flex items-center justify-center text-[#857D74] hover:text-[#1C1A17] rounded hover:bg-[#F0ECE4] transition-colors cursor-pointer"
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
                          <path d="M4 20h4l10-10-4-4L4 16z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        disabled={inUse}
                        title={
                          inUse
                            ? 'Categorias com artigos não podem ser excluídas (BR-009)'
                            : 'Excluir categoria'
                        }
                        className={`w-7 h-7 inline-flex items-center justify-center rounded transition-colors ${
                          inUse
                            ? 'text-[#CFC7BC] cursor-not-allowed'
                            : 'text-[#B5442B] hover:bg-[#FDF6F4] cursor-pointer'
                        }`}
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
                          <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex gap-2.5 bg-[#F9F7F2] border border-[#E9E4DB] rounded p-3">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#857D74"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" />
            </svg>
            <span className="text-[12.5px] leading-relaxed text-[#55504A]">
              Categorias com artigos associados não podem ser excluídas — o ícone fica desabilitado
              (BR-009).
            </span>
          </div>
        </section>

        {/* Right Column: Tags */}
        <section className="flex flex-col gap-3.5 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[17px] font-semibold text-[#1C1A17] m-0">
              Tags{' '}
              <span className="font-mono text-[13px] text-[#A29A90] font-normal">
                {tags.length}
              </span>
            </h2>
            <button
              onClick={handleStartCreateTag}
              className="inline-flex items-center gap-1.5 h-[34px] px-3.5 border border-[#DDD6CB] rounded bg-white text-[#38332E] hover:bg-[#FAF8F4] text-[13.5px] transition-colors cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Nova
            </button>
          </div>

          <div className="bg-white border border-[#E4DFD7] rounded-lg p-4 sm:p-[18px] flex flex-col gap-4 shadow-sm">
            {/* Tag Pills */}
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => {
                const isSelected = editingTag?.id === tag.id;
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleSelectTagForEdit(tag)}
                    className={`inline-flex items-center gap-2 h-8 px-2.5 rounded font-mono text-[12.5px] transition-colors cursor-pointer ${
                      isSelected
                        ? 'border border-[#1C1A17] bg-[#1C1A17] text-[#FAF8F4]'
                        : tag.postCount > 0
                        ? 'border border-[#E4DFD7] bg-[#FAF8F4] text-[#38332E] hover:border-[#1C1A17]'
                        : 'border border-dashed border-[#DDD6CB] text-[#A29A90] hover:border-[#1C1A17]'
                    }`}
                  >
                    <span>{tag.namePtBr}</span>
                    <span
                      className={
                        isSelected
                          ? 'text-[#A29A90]'
                          : tag.postCount > 0
                          ? 'text-[#857D74]'
                          : 'text-[#C4BCB1]'
                      }
                    >
                      {tag.postCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tag Inline Edit / Create Form */}
            {(editingTag || isCreatingTag) && (
              <>
                <div className="h-px bg-[#F0ECE4]" />
                <form onSubmit={handleSaveTag} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#857D74]">
                      {editingTag ? `Editando: ${editingTag.namePtBr}` : 'Nova Tag'}
                    </span>
                    {editingTag && editingTag.postCount === 0 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(editingTag)}
                        className="text-[12px] text-[#B5442B] hover:underline"
                      >
                        Excluir tag
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12.5px] text-[#55504A]">Rótulo pt-BR</label>
                      <input
                        type="text"
                        required
                        value={tagNamePtBr}
                        onChange={(e) => setTagNamePtBr(e.target.value)}
                        className="h-9 px-2.5 border border-[#DDD6CB] rounded font-mono text-[12.5px] text-[#1C1A17] outline-none focus:border-[#1C1A17]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12.5px] text-[#55504A]">Rótulo en</label>
                      <input
                        type="text"
                        required
                        value={tagNameEn}
                        onChange={(e) => setTagNameEn(e.target.value)}
                        className="h-9 px-2.5 border border-[#DDD6CB] rounded font-mono text-[12.5px] text-[#1C1A17] outline-none focus:border-[#1C1A17]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTag(null);
                        setIsCreatingTag(false);
                      }}
                      className="h-[34px] px-3.5 border border-[#DDD6CB] rounded bg-white text-[#38332E] hover:bg-[#FAF8F4] text-[13.5px] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="h-[34px] px-4 rounded bg-[#1C1A17] hover:bg-[#2E2A26] text-[#FAF8F4] text-[13.5px] font-medium cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1A17]/40 flex items-center justify-center p-5">
          <form
            onSubmit={handleSaveCategory}
            className="w-full max-w-[440px] bg-white rounded-lg shadow-xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <h3 className="text-[18px] font-semibold text-[#1C1A17] m-0">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#38332E] font-medium">Nome em pt-BR</label>
              <input
                type="text"
                required
                value={catNamePtBr}
                onChange={(e) => setCatNamePtBr(e.target.value)}
                placeholder="Ex: Arquitetura"
                className="h-10 px-3 border border-[#DDD6CB] rounded text-[14px] text-[#1C1A17] outline-none focus:border-[#1C1A17]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] text-[#38332E] font-medium">Nome em en</label>
              <input
                type="text"
                required
                value={catNameEn}
                onChange={(e) => setCatNameEn(e.target.value)}
                placeholder="Ex: Architecture"
                className="h-10 px-3 border border-[#DDD6CB] rounded text-[14px] text-[#1C1A17] outline-none focus:border-[#1C1A17]"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="h-9 px-4 border border-[#DDD6CB] rounded bg-white text-[#38332E] text-[13.5px]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-9 px-4 rounded bg-[#1C1A17] text-[#FAF8F4] text-[13.5px] font-medium"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-72 z-50 flex items-center gap-3 bg-[#1C1A17] rounded-md p-[14px_18px] shadow-lg animate-in slide-in-from-bottom-2">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9BB89B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12l5 5L20 6" />
          </svg>
          <span className="text-[14px] text-[#FAF8F4]">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-5 text-[13px] text-[#A29A90] hover:text-white cursor-pointer"
          >
            Fechar
          </button>
        </div>
      )}
    </main>
  );
}
