import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Redefine Me — Discover',
  description: 'Society events + curated city events. Register externally — we personalise what you see.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          src="https://www.ameportal.com/tracker.js"
          data-website-id="m57b1sb5p4q4rq6cbdg884c2cs83w0mv"
          strategy="afterInteractive"
        />
      </head>
      <body className={spaceGrotesk.className}>
        {children}
      </body>
    </html>
  );
}

