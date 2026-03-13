import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Image AI API',
  description: 'Backend API for fridge item detection.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
