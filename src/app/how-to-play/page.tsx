import Link from 'next/link';

export default function HowToPlayPage() {
  return (
    <main className="page static-page">
      <div className="static-page__inner">
        <h1 className="static-page__title">How to Play</h1>
        <p className="static-page__lead">
          Rules from the official Heroes &amp; Wizards rule book. This digital version follows the same rules.
        </p>

        <section className="static-page__section">
          <p className="static-page__body">
            The kingdom is in danger! The goal of Heroes and Wizards is to collect cards to build a legendary party (team) of heroes and to send that party on an epic quest to save the kingdom. The first player to begin this quest wins the game, but only parties with enough matching skill can brave such a task!
          </p>
        </section>

        <section className="static-page__section">
          <h2 className="static-page__h2">Set Up</h2>
          <p className="static-page__body">
            Make sure you have a table or flat playing area large enough for all players.
          </p>
          <p className="static-page__body">
            Start the game by shuffling all the cards together then dealing 3 cards to each player. These cards form each player&apos;s hand and should be kept private and off the table.
          </p>
          <p className="static-page__body">
            Next, place the deck (all unused cards) face-down in the middle of the table.
          </p>
          <p className="static-page__body">
            Finally, choose a player to have the first turn.
          </p>
        </section>

        <section className="static-page__section">
          <h2 className="static-page__h2">How to Play</h2>
          <p className="static-page__body">
            Players take turns one at a time. Each player has their turn after the player on their right.
          </p>
          <p className="static-page__body">
            On each of your turns, you must choose to complete one action only! For example, you cannot draw and play on the same turn.
          </p>
          <p className="static-page__body">
            There are 3 different action options to choose from on each turn, as explained throughout the rest of these instructions.
          </p>
        </section>

        <section className="static-page__section">
          <h2 className="static-page__h2">Option 1 — Draw a Card</h2>
          <p className="static-page__body">
            If you choose to draw a card on your turn, simply pick up one card from the top of the deck and add it to your hand.
          </p>
          <p className="static-page__body">
            You cannot choose to draw a card if you already have 5 cards in your hand.
          </p>
        </section>

        <section className="static-page__section">
          <h2 className="static-page__h2">Option 2 — Play a Card</h2>
          <p className="static-page__body">
            If you choose to play a card (use a card), you can play any one card from your hand.
          </p>
          <p className="static-page__body">
            Each type of card is played differently, as explained below.
          </p>

          <h3 className="static-page__h3">Hero Cards (Beige)</h3>
          <p className="static-page__body">
            These cards can be played face-up onto the table in front of you.
          </p>
          <p className="static-page__body">
            Once a hero is on the table, it is now a part of your party (not your hand). Every player has their own party with their own different heroes in it, each visible to all players.
          </p>
          <p className="static-page__body">
            Every hero has a hero type (either Knight, Archer, Barbarian, or Thief), as shown by a symbol in the top right corner of the card. Your party can only contain one of each type at any time.
          </p>
          <p className="static-page__body">
            If you play a hero card with a type that is already in your party, you must swap the card of the matching type back into your hand.
          </p>
          <p className="static-page__body">
            Each hero card also has two or three skill symbols at the bottom of the card. These symbols represent the powerful traits each hero possesses. Some heroes are masters of a certain skill and have two of the same skill symbol.
          </p>
          <p className="static-page__body">
            A party with at least 6 matching skills is ready to go on a quest and win the game.
          </p>

          <figure className="static-page__figure">
            <img
              src="/images/hw_cards_sample.png"
              alt="Sample of Heroes & Wizards cards"
              className="static-page__img static-page__img--half"
            />
          </figure>

          <h3 className="static-page__h3">Wizard Cards (Blue)</h3>
          <p className="static-page__body">
            These cards are played exactly like hero cards except that instead of skills, they each have a special ability written on them.
          </p>
          <p className="static-page__body">
            When a wizard is part of a party, its special ability applies to the player that owns the party. Wizard abilities apply regardless of the other rules in these instructions.
          </p>
          <p className="static-page__body">
            Just like each hero type, you can only have one of each wizard type in your party at a time. You can have a wizard in your party even if you have no heroes in it.
          </p>

          <h3 className="static-page__h3">Event Cards (Green)</h3>
          <p className="static-page__body">
            These cards are played face-up onto a pile beside the deck called the event pile. When you play an event card, you must follow the instructions on that card, even if following the instructions has no effect.
          </p>
          <figure className="static-page__figure">
            <img
              src="/images/hw_cards_sample_larger.png"
              alt="Sample of Heroes & Wizards cards"
              className="static-page__img"
            />
          </figure>
          <p className="static-page__body">
            <strong>Note:</strong> If you use an event card to steal a hero from another player&apos;s party, the stolen card must enter your own party immediately and the card it replaces (if any) must be given to the party of the player you stole from. If you are required to steal a card from a player&apos;s hand instead, the stolen card must enter your hand, not your party.
          </p>

          <h3 className="static-page__h3">Quest Cards (Purple)</h3>
          <p className="static-page__body">
            You can use a quest card to take your party on an epic quest to save the kingdom and win the game!
          </p>
          <figure className="static-page__figure">
            <img
              src="/cards/quest_card.png"
              alt="Quest card example"
              className="static-page__img static-page__img--quarter"
            />
          </figure>
          <p className="static-page__body">
            To go on a quest, simply play a quest card anywhere onto the table! But you can only play a quest card if your party has at least 6 matching skills in it (for example, 6 Magic skills).
          </p>
          <p className="static-page__body">
            If your party has the matching skills required when you play the quest card, then you win the game and the game is over!
          </p>
        </section>

        <section className="static-page__section">
          <h2 className="static-page__h2">Option 3 — Dump a Card</h2>
          <p className="static-page__body">
            If you do not want to use a particular card in your hand, you can place it face-up onto the event pile to get rid of it. This action counts as your whole turn.
          </p>
          <p className="static-page__body">
            You cannot dump event cards (green cards). Any event card placed on the event pile must be played (not dumped).
          </p>
        </section>

        <section className="static-page__section">
          <h2 className="static-page__h2">Finishing the Game</h2>
          <p className="static-page__body">
            Continue playing until one player wins by going on a quest!
          </p>
          <p className="static-page__body">
            <strong>Note:</strong> If all the cards in the deck are drawn before the game is finished, players can then also win by playing the &quot;Giant Eagles Arrive&quot; event card on their turn!
          </p>
          <figure className="static-page__figure">
            <img
              src="/cards/event_eagles.png"
              alt="Giant Eagles Arrive event card"
              className="static-page__img static-page__img--quarter"
            />
          </figure>
        </section>

        <p className="static-page__official">
          Official game and full instructions:{' '}
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
