"use client";

import {
  ArrowDown,
  ArrowRight,
  Bell,
  CaretDown,
  Check,
  CheckCircle,
  CirclesThreePlus,
  Clock,
  CurrencyDollar,
  Info,
  List,
  MagnifyingGlass,
  Question,
  ShieldCheck,
  SlidersHorizontal,
  Sparkle,
  Stack,
  Vault,
  Wallet,
  X,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

type View = "discover" | "routes" | "vault";

type Card = {
  id: string;
  name: string;
  set: string;
  number: string;
  grade: string;
  value: number;
  image: string;
  era: "Vintage" | "Modern";
  change: number;
  owned?: boolean;
};

const cards: Card[] = [
  {
    id: "umbreon",
    name: "Umbreon VMAX",
    set: "Evolving Skies",
    number: "215/203",
    grade: "PSA 10",
    value: 2450,
    image: "/cards/umbreon.png",
    era: "Modern",
    change: 4.8,
    owned: true,
  },
  {
    id: "rayquaza",
    name: "Rayquaza VMAX",
    set: "Evolving Skies",
    number: "218/203",
    grade: "PSA 10",
    value: 2780,
    image: "/cards/rayquaza.png",
    era: "Modern",
    change: 2.1,
  },
  {
    id: "charizard",
    name: "Charizard",
    set: "Base Set",
    number: "4/102",
    grade: "PSA 9",
    value: 2940,
    image: "/cards/charizard.png",
    era: "Vintage",
    change: 1.6,
  },
  {
    id: "gengar",
    name: "Gengar VMAX",
    set: "Fusion Strike",
    number: "271/264",
    grade: "PSA 10",
    value: 1120,
    image: "/cards/gengar.png",
    era: "Modern",
    change: 5.3,
    owned: true,
  },
  {
    id: "blastoise",
    name: "Blastoise",
    set: "Base Set",
    number: "2/102",
    grade: "PSA 9",
    value: 510,
    image: "/cards/blastoise.png",
    era: "Vintage",
    change: -0.8,
    owned: true,
  },
  {
    id: "mewtwo",
    name: "Mewtwo",
    set: "Base Set",
    number: "10/102",
    grade: "PSA 9",
    value: 390,
    image: "/cards/mewtwo.png",
    era: "Vintage",
    change: 0.6,
    owned: true,
  },
  {
    id: "lugia",
    name: "Lugia V",
    set: "Silver Tempest",
    number: "186/195",
    grade: "PSA 10",
    value: 460,
    image: "/cards/lugia.png",
    era: "Modern",
    change: 3.4,
  },
  {
    id: "gardevoir",
    name: "Gardevoir ex",
    set: "Scarlet & Violet",
    number: "245/198",
    grade: "PSA 10",
    value: 215,
    image: "/cards/gardevoir.png",
    era: "Modern",
    change: 7.2,
  },
];

const ownedCards = cards.filter((card) => card.owned);

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const participants = [
  {
    role: "You give",
    name: "You",
    avatar: "/avatars/jordan.jpg",
    card: cards[0],
    topUp: 330,
  },
  {
    role: "Mira gives",
    name: "Mira",
    avatar: "/avatars/mira.jpg",
    card: cards[1],
    topUp: 160,
  },
  {
    role: "Theo gives",
    name: "Theo",
    avatar: "/avatars/theo.jpg",
    card: cards[2],
    topUp: 0,
  },
];

function CardImage({ card, compact = false }: { card: Card; compact?: boolean }) {
  return (
    <div className={`slab ${compact ? "slab-compact" : ""}`}>
      <div className="slab-grade">
        <span>VAULTED</span>
        <strong>{card.grade.replace("PSA ", "")}</strong>
      </div>
      <img src={card.image} alt={`${card.name} from ${card.set}`} />
    </div>
  );
}

function StatusPill({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "blue" | "amber" }) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

function TopBar({
  activeView,
  setActiveView,
  query,
  setQuery,
  setHelpOpen,
}: {
  activeView: View;
  setActiveView: (view: View) => void;
  query: string;
  setQuery: (value: string) => void;
  setHelpOpen: (open: boolean) => void;
}) {
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="topbar">
      <button className="brand" onClick={() => setActiveView("routes")} aria-label="Go to GrailRoute home">
        Grail<span>Route</span>
      </button>

      <nav className={`primary-nav ${mobileOpen ? "mobile-open" : ""}`} aria-label="Primary navigation">
        {(["discover", "routes", "vault"] as View[]).map((item) => (
          <button
            key={item}
            className={activeView === item ? "nav-active" : ""}
            onClick={() => {
              setActiveView(item);
              setMobileOpen(false);
            }}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
        <button className="nav-help-mobile" onClick={() => { setHelpOpen(true); setMobileOpen(false); }}>
          How it works
        </button>
      </nav>

      <label className="global-search">
        <MagnifyingGlass size={18} aria-hidden="true" />
        <input
          id="global-card-search"
          aria-label="Search cards, sets, or collectors"
          placeholder="Search cards, sets, or collectors"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => activeView !== "discover" && setActiveView("discover")}
        />
        <kbd>⌘K</kbd>
      </label>

      <div className="top-actions">
        <button className="text-action help-action" onClick={() => setHelpOpen(true)}>
          <Question size={18} />
          <span>How it works</span>
        </button>
        <button className="icon-button" aria-label="Notifications" title="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>
        <div className="account-wrap">
          <button className="account-button" onClick={() => setAccountOpen((value) => !value)} aria-expanded={accountOpen}>
            <img src="/avatars/jordan.jpg" alt="" />
            <span>Jordan Lee</span>
            <CaretDown size={14} />
          </button>
          {accountOpen && (
            <div className="account-menu" role="menu">
              <div>
                <strong>Jordan Lee</strong>
                <span>jordan@example.com</span>
              </div>
              <button role="menuitem"><Wallet size={17} /> Wallet & payments</button>
              <button role="menuitem"><ShieldCheck size={17} /> Security</button>
              <button role="menuitem"><SlidersHorizontal size={17} /> Preferences</button>
            </div>
          )}
        </div>
        <button className="mobile-menu" onClick={() => setMobileOpen((value) => !value)} aria-label={mobileOpen ? "Close navigation" : "Open navigation"}>
          {mobileOpen ? <X size={22} /> : <List size={22} />}
        </button>
      </div>
    </header>
  );
}

function RouteMap({ onTipDismiss, tipVisible }: { onTipDismiss: () => void; tipVisible: boolean }) {
  return (
    <section className="route-map" aria-label="Three party Grail Route">
      <div className="trust-row">
        <span><ShieldCheck size={18} weight="fill" /> All assets custody verified</span>
        <span>Live on Robinhood Chain</span>
        <StatusPill tone="blue">Testnet preview</StatusPill>
      </div>

      <div className="participants">
        {participants.map((participant, index) => (
          <div className="participant-wrap" key={participant.name}>
            <article className="participant">
              <span className="participant-role">{participant.role}</span>
              <div className="participant-content">
                <div className="identity">
                  <img src={participant.avatar} alt="" />
                  <strong>{participant.name}</strong>
                </div>
                <CardImage card={participant.card} />
              </div>
              <div className="participant-meta">
                <span>{participant.card.grade} · {participant.card.number}</span>
                <strong>{currency.format(participant.card.value)}</strong>
              </div>
            </article>
            {index < participants.length - 1 && (
              <div className="route-connector" aria-hidden="true">
                <ArrowRight className="arrow-desktop" size={28} />
                <ArrowDown className="arrow-mobile" size={28} />
                <span>+{currency.format(participant.topUp)} USDG</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {tipVisible && (
        <div className="map-tip" role="note">
          <Info size={18} weight="fill" />
          <span><strong>Follow the path.</strong> Every leg settles together, or none of them do.</span>
          <button onClick={onTipDismiss} aria-label="Dismiss tip"><X size={16} /></button>
        </div>
      )}
    </section>
  );
}

function RouteInspector({ onAccept, onAdjust }: { onAccept: () => void; onAdjust: () => void }) {
  const target = cards[2];
  return (
    <aside className="route-inspector">
      <div className="inspector-heading">
        <span>Route match <Info size={15} /></span>
        <strong>96%</strong>
        <em>High confidence · ~5 min to settle</em>
      </div>

      <div className="receive-block">
        <span className="eyebrow">You receive</span>
        <div className="receive-card">
          <CardImage card={target} compact />
          <div>
            <h2>{target.name}</h2>
            <p>{target.set}<br />#{target.number} · {target.grade}</p>
            <StatusPill><ShieldCheck size={14} weight="fill" /> Vault verified</StatusPill>
            <span className="market-label">Market value</span>
            <strong className="market-price">{currency.format(target.value)}</strong>
          </div>
        </div>
      </div>

      <dl className="value-summary">
        <div><dt>Your card</dt><dd>{currency.format(cards[0].value)}</dd></div>
        <div><dt>USDG top-up</dt><dd>{currency.format(330)}</dd></div>
        <div className="summary-total"><dt>Total you give</dt><dd>{currency.format(2780)}</dd></div>
        <div><dt>Total you receive</dt><dd>{currency.format(target.value)}</dd></div>
        <div className="summary-positive"><dt>Difference</dt><dd>+{currency.format(160)}</dd></div>
      </dl>

      <div className="gas-row">
        <span><Sparkle size={17} weight="fill" /> Sponsored gas <Info size={14} /></span>
        <strong>$0.00</strong>
      </div>

      <button className="primary-button" onClick={onAccept}>
        Accept route <ArrowRight size={19} />
      </button>
      <button className="secondary-button" onClick={onAdjust}>Adjust offer</button>
      <p className="terms-note">Nothing moves until you confirm. Review <button>route terms</button>.</p>
    </aside>
  );
}

function AlternativeRoutes() {
  const alternatives = [
    { match: 92, time: "~7 min", people: ["Mira", "Theo"], total: 2860 },
    { match: 89, time: "~9 min", people: ["Aya", "Mira"], total: 2810 },
    { match: 85, time: "~12 min", people: ["Theo", "Nico"], total: 2760 },
  ];

  return (
    <section className="alternatives">
      <div className="section-title-row">
        <div>
          <h2>Other routes for this card</h2>
          <p>Similar matches with different timing and top-ups.</p>
        </div>
        <button>View all <ArrowRight size={16} /></button>
      </div>
      <div className="alternative-list">
        {alternatives.map((route) => (
          <button className="alternative-row" key={route.match}>
            <StatusPill tone="blue">{route.match}% match</StatusPill>
            <div className="mini-path">
              {route.people.map((person, index) => (
                <span key={person}>
                  <span className="mini-avatar">{person[0]}</span>
                  {index < route.people.length - 1 && <ArrowRight size={15} />}
                </span>
              ))}
            </div>
            <span className="alt-value">{currency.format(route.total)} total</span>
            <span className="alt-gas"><Sparkle size={14} weight="fill" /> Gas covered</span>
            <span className="alt-time">{route.time}</span>
            <ArrowRight size={18} />
          </button>
        ))}
      </div>
    </section>
  );
}

function RoutesView({ onAccept, onAdjust, tipVisible, dismissTip }: { onAccept: () => void; onAdjust: () => void; tipVisible: boolean; dismissTip: () => void }) {
  return (
    <main className="routes-view">
      <section className="route-hero">
        <div className="route-workspace">
          <div className="route-main">
            <div className="hero-copy">
              <span className="page-kicker"><CirclesThreePlus size={18} /> Multi-party route · 3 collectors</span>
              <h1>A smarter path to the card you want.</h1>
              <p>Discover and settle verified trade routes in one transaction on Robinhood Chain.</p>
            </div>
            <RouteMap tipVisible={tipVisible} onTipDismiss={dismissTip} />
          </div>
          <RouteInspector onAccept={onAccept} onAdjust={onAdjust} />
        </div>
      </section>
      <AlternativeRoutes />
    </main>
  );
}

function DiscoverView({ query, setQuery, onTarget }: { query: string; setQuery: (value: string) => void; onTarget: (card: Card) => void }) {
  const [filter, setFilter] = useState("All");
  const visibleCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesQuery = `${card.name} ${card.set}`.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All" || card.era === filter || (filter === "Under $1k" && card.value < 1000);
      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);

  return (
    <main className="catalog-view">
      <div className="catalog-heading">
        <div>
          <span className="page-kicker"><MagnifyingGlass size={18} /> Curated and custody verified</span>
          <h1>Find your next grail.</h1>
          <p>Set any card as a target. GrailRoute will search every compatible collection, not just active listings.</p>
        </div>
        <button className="primary-button compact-button"><Bell size={18} /> Create an alert</button>
      </div>
      <div className="filter-row" aria-label="Card filters">
        {["All", "Vintage", "Modern", "Under $1k"].map((item) => (
          <button key={item} className={filter === item ? "filter-active" : ""} onClick={() => setFilter(item)}>{item}</button>
        ))}
        <span>{visibleCards.length} verified cards</span>
      </div>
      <label className="catalog-search-mobile">
        <MagnifyingGlass size={18} aria-hidden="true" />
        <input aria-label="Search the card catalog" placeholder="Search cards or sets" value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {visibleCards.length ? (
        <div className="card-grid">
          {visibleCards.map((card) => (
            <article className="market-card" key={card.id}>
              <div className="market-image">
                <CardImage card={card} />
                <StatusPill><ShieldCheck size={14} weight="fill" /> Verified</StatusPill>
              </div>
              <div className="market-card-copy">
                <span>{card.set} · {card.number}</span>
                <h2>{card.name}</h2>
                <p>{card.grade}</p>
                <div>
                  <strong>{currency.format(card.value)}</strong>
                  <em className={card.change >= 0 ? "positive" : "negative"}>{card.change >= 0 ? "+" : ""}{card.change}%</em>
                </div>
                <button onClick={() => onTarget(card)}>Set as target <ArrowRight size={17} /></button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <MagnifyingGlass size={32} />
          <h2>No cards match that search.</h2>
          <p>Try another card name, set, or collector.</p>
        </div>
      )}
    </main>
  );
}

function VaultView({ onCreateRoute }: { onCreateRoute: (selected: Card[]) => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>(["umbreon"]);
  const vaultValue = ownedCards.reduce((total, card) => total + card.value, 0);
  const selected = ownedCards.filter((card) => selectedIds.includes(card.id));

  function toggleCard(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  }

  return (
    <main className="vault-view">
      <div className="catalog-heading">
        <div>
          <span className="page-kicker"><Vault size={18} /> Your insured collection</span>
          <h1>Vault</h1>
          <p>Select up to three cards to start a route. Every item below is independently custody verified.</p>
        </div>
        <button className="primary-button compact-button" disabled={!selected.length} onClick={() => onCreateRoute(selected)}>
          Create route with {selected.length} {selected.length === 1 ? "card" : "cards"} <ArrowRight size={18} />
        </button>
      </div>
      <section className="vault-stats">
        <div><span>Total vault value</span><strong>{currency.format(vaultValue)}</strong><em>+3.6% this month</em></div>
        <div><span>Verified cards</span><strong>{ownedCards.length}</strong><em>100% reconciled</em></div>
        <div><span>Active routes</span><strong>2</strong><em>1 new match</em></div>
        <div><span>Last custody check</span><strong>8m</strong><em>All clear</em></div>
      </section>
      <div className="vault-toolbar">
        <span>{selected.length}/3 selected</span>
        <button><Stack size={17} /> Group by set</button>
        <button><SlidersHorizontal size={17} /> Sort: value</button>
      </div>
      <div className="vault-grid">
        {ownedCards.map((card) => {
          const isSelected = selectedIds.includes(card.id);
          return (
            <button className={`vault-card ${isSelected ? "vault-card-selected" : ""}`} key={card.id} onClick={() => toggleCard(card.id)} aria-pressed={isSelected}>
              <span className="selection-check">{isSelected ? <Check size={16} weight="bold" /> : <span />}</span>
              <CardImage card={card} />
              <span className="vault-card-info">
                <span>{card.set}</span>
                <strong>{card.name}</strong>
                <em>{card.grade} · {currency.format(card.value)}</em>
              </span>
            </button>
          );
        })}
      </div>
    </main>
  );
}

function BuilderDrawer({ target, initialOffers, onClose, onUpdate }: { target: Card | null; initialOffers: Card[]; onClose: () => void; onUpdate: (topUp: number) => void }) {
  const [topUp, setTopUp] = useState(330);
  const [offerIds, setOfferIds] = useState<string[]>(initialOffers.length ? initialOffers.map((card) => card.id) : ["umbreon"]);
  const offers = ownedCards.filter((card) => offerIds.includes(card.id));
  const offerValue = offers.reduce((total, card) => total + card.value, 0);
  const selectedTarget = target ?? cards[2];
  const match = Math.min(99, 87 + offers.length * 2 + Math.round(topUp / 45));

  function toggleOffer(id: string) {
    setOfferIds((current) => current.includes(id) ? (current.length > 1 ? current.filter((item) => item !== id) : current) : current.length < 3 ? [...current, id] : current);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="builder-drawer" role="dialog" aria-modal="true" aria-labelledby="builder-title">
        <div className="drawer-title">
          <div><span className="page-kicker"><CirclesThreePlus size={17} /> Route builder</span><h2 id="builder-title">Shape your offer</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close route builder"><X size={21} /></button>
        </div>

        <div className="builder-step">
          <div className="step-label"><span>1</span><div><strong>Choose what you offer</strong><em>Select up to three vaulted cards · {offerIds.length}/3 selected</em></div></div>
          <div className="offer-options">
            {ownedCards.map((card) => (
              <button key={card.id} className={offerIds.includes(card.id) ? "offer-selected" : ""} onClick={() => toggleOffer(card.id)} aria-pressed={offerIds.includes(card.id)}>
                <img src={card.image} alt="" /><span><strong>{card.name}</strong><em>{currency.format(card.value)}</em></span>{offerIds.includes(card.id) && <CheckCircle size={19} weight="fill" />}
              </button>
            ))}
          </div>
        </div>

        <div className="builder-step">
          <div className="step-label"><span>2</span><div><strong>Your target</strong><em>We’ll search direct and multi-party paths</em></div></div>
          <div className="target-summary"><img src={selectedTarget.image} alt="" /><span><strong>{selectedTarget.name}</strong><em>{selectedTarget.set} · {selectedTarget.grade}</em></span><strong>{currency.format(selectedTarget.value)}</strong></div>
          <div className="inline-tip"><Sparkle size={16} weight="fill" /><span><strong>Tip:</strong> add up to 3 acceptable targets to find a faster match.</span></div>
        </div>

        <div className="builder-step">
          <div className="step-label"><span>3</span><div><strong>Add an optional top-up</strong><em>Paid only if your route settles</em></div></div>
          <label className="amount-input"><CurrencyDollar size={21} /><input type="number" min="0" step="10" value={topUp} onChange={(event) => setTopUp(Math.max(0, Number(event.target.value)))} /><span>USDG</span></label>
          <div className="quick-amounts">{[0, 250, 500, 750].map((amount) => <button key={amount} onClick={() => setTopUp(amount)}>{amount === 0 ? "None" : `+${currency.format(amount)}`}</button>)}</div>
        </div>

        <div className="builder-preview">
          <span>Estimated match strength</span><strong>{match}%</strong>
          <div><span style={{ width: `${match}%` }} /></div>
          <p>{currency.format(offerValue + topUp)} total offer · {offers.length} {offers.length === 1 ? "card" : "cards"} · gas sponsored</p>
        </div>
        <button className="primary-button" onClick={() => onUpdate(topUp)}>Find my route <ArrowRight size={19} /></button>
        <p className="terms-note">No card or funds move during matching.</p>
      </aside>
    </div>
  );
}

function ConfirmModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close confirmation"><X size={20} /></button>
        <span className="confirm-icon"><ShieldCheck size={28} weight="fill" /></span>
        <span className="page-kicker">Final review</span>
        <h2 id="confirm-title">Confirm your Grail Route</h2>
        <p>All three collectors are ready. Your card and USDG will settle together after each signature is verified.</p>
        <div className="confirm-swap">
          <div><img src={cards[0].image} alt="" /><span><strong>{cards[0].name}</strong><em>+ $330 USDG</em></span></div>
          <ArrowRight size={24} />
          <div><img src={cards[2].image} alt="" /><span><strong>{cards[2].name}</strong><em>You receive</em></span></div>
        </div>
        <div className="confirm-checks">
          <span><CheckCircle size={17} weight="fill" /> Custody verified</span>
          <span><CheckCircle size={17} weight="fill" /> Gas sponsored</span>
          <span><CheckCircle size={17} weight="fill" /> Atomic settlement</span>
        </div>
        <button className="primary-button" onClick={onConfirm}>Sign and accept route <ArrowRight size={19} /></button>
        <button className="secondary-button" onClick={onClose}>Not yet</button>
      </div>
    </div>
  );
}

function HelpPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="help-panel" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <div className="drawer-title"><div><span className="page-kicker"><Question size={17} /> Quick guide</span><h2 id="help-title">How GrailRoute works</h2></div><button className="icon-button" onClick={onClose} aria-label="Close guide"><X size={21} /></button></div>
        <p className="help-intro">Trade the cards you own for the cards you want—without selling each one first.</p>
        {[
          [<Vault key="vault" size={21} />, "Vault your cards", "Eligible graded cards are authenticated, insured, and represented 1:1 onchain."],
          [<MagnifyingGlass key="search" size={21} />, "Choose your grail", "Pick a target and set the cards or USDG you’re comfortable offering."],
          [<CirclesThreePlus key="route" size={21} />, "We find the path", "GrailRoute searches direct swaps and multi-party loops across verified collections."],
          [<ShieldCheck key="settle" size={21} />, "Settle together", "Every leg completes atomically. If one leg fails, nothing moves."],
        ].map(([icon, title, text], index) => (
          <div className="help-step" key={String(title)}><span>{icon}</span><div><em>0{index + 1}</em><strong>{title}</strong><p>{text}</p></div></div>
        ))}
        <div className="help-callout"><Sparkle size={18} weight="fill" /><div><strong>New collector?</strong><p>Start in Discover and set one card as your target. We’ll guide the rest.</p></div></div>
        <button className="primary-button" onClick={onClose}>Got it</button>
      </aside>
    </div>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("routes");
  const [query, setQuery] = useState("");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Card | null>(null);
  const [selectedOffers, setSelectedOffers] = useState<Card[]>([cards[0]]);
  const [tipVisible, setTipVisible] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("grailroute-route-tip-dismissed");
    if (dismissed === "true") setTipVisible(false);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveView("discover");
        window.requestAnimationFrame(() => document.getElementById("global-card-search")?.focus());
      }
      if (event.key === "Escape") {
        setBuilderOpen(false);
        setConfirmOpen(false);
        setHelpOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function dismissTip() {
    setTipVisible(false);
    window.localStorage.setItem("grailroute-route-tip-dismissed", "true");
  }

  function chooseTarget(card: Card) {
    setSelectedTarget(card);
    setBuilderOpen(true);
  }

  function settleRoute() {
    setConfirmOpen(false);
    setToast("Route accepted. Waiting on 2 collector signatures.");
    window.setTimeout(() => setToast(null), 5000);
  }

  return (
    <div className="app-shell">
      <TopBar activeView={activeView} setActiveView={setActiveView} query={query} setQuery={setQuery} setHelpOpen={setHelpOpen} />
      {activeView === "routes" && <RoutesView onAccept={() => setConfirmOpen(true)} onAdjust={() => setBuilderOpen(true)} tipVisible={tipVisible} dismissTip={dismissTip} />}
      {activeView === "discover" && <DiscoverView query={query} setQuery={setQuery} onTarget={chooseTarget} />}
      {activeView === "vault" && <VaultView onCreateRoute={(selected) => { setSelectedOffers(selected); setBuilderOpen(true); setActiveView("routes"); }} />}

      <footer className="site-footer">
        <span><span className="live-dot" /> Robinhood Chain testnet · All systems operational</span>
        <nav><button onClick={() => setHelpOpen(true)}>Help</button><button>Terms</button><button>Privacy</button><button>Status</button></nav>
        <span>Unofficial collector prototype · Not affiliated with Pokémon or Robinhood.</span>
      </footer>

      {builderOpen && <BuilderDrawer target={selectedTarget} initialOffers={selectedOffers} onClose={() => setBuilderOpen(false)} onUpdate={() => { setBuilderOpen(false); setActiveView("routes"); setToast("Route updated. We found a 97% match."); window.setTimeout(() => setToast(null), 5000); }} />}
      {confirmOpen && <ConfirmModal onClose={() => setConfirmOpen(false)} onConfirm={settleRoute} />}
      {helpOpen && <HelpPanel onClose={() => setHelpOpen(false)} />}
      {toast && <div className="toast" role="status"><CheckCircle size={20} weight="fill" /><span>{toast}</span><button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={16} /></button></div>}
    </div>
  );
}
