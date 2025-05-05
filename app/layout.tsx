import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Basado de Acme Dashboard',
    default: 'Colsign',
  },
  description: 'Colsign project to support the social inclusion of Colombian deaf people.',
  metadataBase: new URL('https://colsigns-app.vercel.app/'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
