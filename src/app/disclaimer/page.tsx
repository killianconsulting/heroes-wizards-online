import Link from 'next/link';

export default function DisclaimerPage() {
  return (
    <main className="page static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">Disclaimer</h1>
        <p className="static-page__lead">
          This digital version of Heroes &amp; Wizards is a <strong>fan-made</strong>, <strong>non-commercial</strong> project.
        </p>
        <ul className="static-page__list">
          <li>It is not affiliated with, endorsed by, or connected to the original creators or publisher of Heroes &amp; Wizards.</li>
          <li>All rights to the game, its name, and its content belong to the original publisher.</li>
          <li>This project is for personal, educational, and non-commercial use only.</li>
        </ul>
        <p className="static-page__body">
          Official game:{' '}
          <a
            href="https://jofgames.com.au/heroes-and-wizards/"
            target="_blank"
            rel="noopener noreferrer"
            className="static-page__link"
          >
            Heroes &amp; Wizards — Jof Games
          </a>
        </p>
        <p className="static-page__back">
          <Link href="/" className="static-page__link">← Back to game</Link>
        </p>
      </div>
    </main>
  );
}
