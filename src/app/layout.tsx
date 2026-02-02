import type { Metadata } from 'next';
import { Londrina_Solid, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { LeaveGameProvider } from '@/context/LeaveGameContext';
import Footer from '@/components/Footer';

const londrinaSolid = Londrina_Solid({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
});

const sourceSans = Source_Sans_3({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Heroes & Wizards',
  description: 'Play Heroes & Wizards online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${londrinaSolid.variable} ${sourceSans.variable}`}>
      <body className="layout-body">
        <LeaveGameProvider>
          <div className="layout-main">{children}</div>
          <Footer />
        </LeaveGameProvider>
      </body>
    </html>
  );
}
