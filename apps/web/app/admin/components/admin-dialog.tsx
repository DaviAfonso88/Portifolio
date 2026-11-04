'use client';

import React, { useLayoutEffect, useRef } from 'react';

interface AdminDialogProps {
  labelledBy: string;
  onClose(): void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Usa o <dialog> nativo, que prende o foco, fecha com Esc e deixa a página de trás inerte.
 * A altura fica limitada à tela e o conteúdo rola, para os botões nunca ficarem fora de alcance.
 */
export function AdminDialog({ labelledBy, onClose, className = '', children }: AdminDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Efeito de layout: o close() precisa rodar antes de o React tirar o elemento da página,
  // senão o navegador não devolve o foco a quem abriu o modal.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain bg-white rounded-lg shadow-2xl backdrop:bg-[#1C1A17]/40 ${className}`}
    >
      {children}
    </dialog>
  );
}
