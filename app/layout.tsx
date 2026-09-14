import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'OSBATT',
  description: "Kahoot x Leetcode x idk what I'm doing",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
