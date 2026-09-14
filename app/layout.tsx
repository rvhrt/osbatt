import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'OSBATT',
  description: 'A shared space to think, code and learn.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
