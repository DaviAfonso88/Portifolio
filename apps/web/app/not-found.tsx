import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#141311] text-[#1C1A17] dark:text-[#EDE9E3] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md flex flex-col items-center gap-4">
        <span className="font-mono text-[13px] tracking-widest uppercase text-[#A6482C]">
          Erro 404
        </span>
        <h1 className="font-display text-[44px] sm:text-[56px] leading-tight m-0">
          Página não encontrada
        </h1>
        <p className="text-[15px] leading-relaxed text-[#55504A] dark:text-[#B5ADA3] m-0">
          O conteúdo que você procurava não existe, foi movido ou o endereço foi digitado
          incorretamente.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded bg-[#1C1A17] hover:bg-[#2E2A26] dark:bg-[#EDE9E3] dark:hover:bg-[#FFFFFF] text-[#FAF8F4] dark:text-[#141311] text-[14px] font-medium transition-colors cursor-pointer"
        >
          ← Voltar ao início
        </Link>
      </div>
    </div>
  );
}
