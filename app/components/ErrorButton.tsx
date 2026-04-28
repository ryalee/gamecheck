import { div } from "framer-motion/client";
import React from "react";

export default function ErrorButton({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="">
      <button className="mt-1 flex cursor-pointer items-center gap-2 rounded-[10px] bg-green-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_10px_rgba(124,106,247,0.35)] transition-all hover:-translate-y-px hover:bg-green-400 active:translate-y-0">
        <a
          href="https://wa.me/5574999115799?text=Olá, sou um usuário do 'Tá Rodando?' e encontrei um erro. Poderiam me ajudar? Obrigado!"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1"
        >
          <img src="/Whatsapp.webp" alt="whatsapp" className="w-6" />
          <p>Envie-nos uma mensagem no WhatsApp</p>
        </a>
      </button>
    </div>
  );
}
