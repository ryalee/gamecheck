import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ta Rodando?',
  description: 'Descubra quais jogos rodam no seu computador com base nas suas configurações',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
