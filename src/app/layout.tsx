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
  icons: {
    icon: '/images/hw_logo.png',
  },
};

const criticalStyles = `
  :root{--bg-dark:#1a1f2e;--surface:#3d4556;--text:#f0f0f0;--text-muted:#a0a8b8;--border:#4a5568;--highlight:#e8b923;--accent-quest:#7c5cbf;--accent-wizard:#4a90d9}
  html,body{min-height:100vh;margin:0;padding:0;background-color:var(--bg-dark);color:var(--text);font-family:system-ui,sans-serif}
  .layout-body{display:flex;flex-direction:column;min-height:100vh}
  .layout-main{flex:1}
  .site-footer{flex-shrink:0;padding:1rem;background:var(--surface);border-top:1px solid var(--border)}
  .site-footer__nav{display:flex;flex-wrap:wrap;gap:1.25rem 2rem;justify-content:center}
  .site-footer__link{color:var(--highlight);font-weight:600;text-decoration:none}
  .site-footer__link:hover{text-decoration:underline}
  .site-footer__credit,.site-footer__publisher,.site-footer__issues{margin:0.5rem 0;color:var(--text);font-size:0.9rem}
  .start-screen{max-width:28rem;margin:0 auto;padding:2rem;text-align:center}
  .start-choice__btn{padding:0.75rem 2rem;font-size:1.1rem;font-weight:600;border:none;border-radius:0.5rem;cursor:pointer}
  .start-choice__btn--local{background:var(--accent-quest);color:white}
  .start-choice__btn--online{background:var(--surface);color:var(--text-muted);cursor:not-allowed;opacity:0.7}
  .start-choice__buttons{display:flex;flex-wrap:wrap;justify-content:center;gap:1.5rem;align-items:flex-start}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${londrinaSolid.variable} ${sourceSans.variable}`}>
      <body className="layout-body">
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
        <LeaveGameProvider>
          <div className="layout-main">{children}</div>
          <Footer />
        </LeaveGameProvider>
      </body>
    </html>
  );
}
