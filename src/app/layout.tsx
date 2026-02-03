import type { Metadata } from 'next';
import { Londrina_Solid, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { LeaveGameProvider } from '@/context/LeaveGameContext';
import { LobbyProvider } from '@/context/LobbyContext';
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
  :root{--bg-dark:#1a1f2e;--bg-table:#2d3548;--surface:#3d4556;--text:#f0f0f0;--text-muted:#a0a8b8;--border:#4a5568;--highlight:#e8b923;--accent-quest:#7c5cbf;--accent-wizard:#4a90d9}
  html,body{min-height:100vh;margin:0;padding:0;background-color:var(--bg-dark);background-image:url('/images/hw_background.jpeg');background-size:cover;background-position:center;background-repeat:no-repeat;background-attachment:fixed;color:var(--text);font-family:system-ui,sans-serif;overflow-x:hidden}
  .layout-body{display:flex;flex-direction:column;min-height:100vh}
  .layout-main{flex:1}
  .site-footer{flex-shrink:0;min-height:140px;padding:0 1rem 1.5rem;background:var(--bg-table);border-top:1px solid var(--border)}
  .site-footer .site-footer__inner{padding-top:1.5rem}
  .site-footer__inner{max-width:40rem;margin:0 auto;display:flex;flex-direction:column;gap:1rem;align-items:center;text-align:center}
  .site-footer__nav{display:flex;flex-wrap:wrap;gap:1.25rem 2rem;justify-content:center}
  .site-footer__link{color:var(--highlight);font-weight:600;text-decoration:none}
  .site-footer__link:hover{text-decoration:underline}
  .site-footer__credit,.site-footer__publisher,.site-footer__issues{margin:0;font-size:0.9rem;color:white;max-width:32rem}
  .site-footer__publisher-link,.site-footer__link{color:var(--highlight)}
  .start-screen{max-width:28rem;margin:0 auto;padding:2rem;text-align:center}
  .start-choice__btn{padding:0.75rem 2rem;font-size:1.1rem;font-weight:600;border:none;border-radius:0.5rem;cursor:pointer}
  .start-choice__btn--local{background:var(--accent-quest);color:white}
  .start-choice__btn--online-active{background:var(--accent-wizard);color:white}
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
          <LobbyProvider>
            <div className="layout-main">{children}</div>
            <Footer />
          </LobbyProvider>
        </LeaveGameProvider>
      </body>
    </html>
  );
}
