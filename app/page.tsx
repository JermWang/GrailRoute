"use client";

import {
  ArrowRight,
  ArrowsClockwise,
  CardsThree,
  Check,
  CheckCircle,
  ClockCounterClockwise,
  Copy,
  DownloadSimple,
  ArrowSquareOut,
  Globe,
  Path,
  Pause,
  Play,
  PlayCircle,
  PlugsConnected,
  Power,
  SealCheck,
  ShieldCheck,
  Sparkle,
  Wallet,
  Warning,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

type RequestArguments = { method: string; params?: unknown[] | Record<string, unknown> };

type EIP1193Provider = {
  request: <T = unknown>(args: RequestArguments) => Promise<T>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type WalletDetail = {
  info: { uuid: string; name: string; icon: string; rdns: string };
  provider: EIP1193Provider;
};

type ChainKey = "mainnet" | "testnet";
type Section = "portfolio" | "routes" | "activity";
type AssetStatus = "unconfigured" | "loading" | "ready" | "error" | "wrong-network";

const CHAINS = {
  mainnet: {
    id: 4663,
    hexId: "0x1237",
    name: "Robinhood Chain",
    shortName: "Mainnet",
    rpcUrl: "https://rpc.mainnet.chain.robinhood.com/",
    explorerUrl: "https://robinhoodchain.blockscout.com",
  },
  testnet: {
    id: 46630,
    hexId: "0xb626",
    name: "Robinhood Chain Testnet",
    shortName: "Testnet",
    rpcUrl: "https://rpc.testnet.chain.robinhood.com/",
    explorerUrl: "https://explorer.testnet.chain.robinhood.com",
  },
} as const;

const ASSET_CONTRACT = process.env.NEXT_PUBLIC_GRAILROUTE_ASSET_CONTRACT?.trim() ?? "";

const SECTIONS: Section[] = ["portfolio", "routes", "activity"];

const WALLET_DOWNLOADS = [
  { name: "MetaMask", href: "https://metamask.io/download" },
  { name: "Rabby", href: "https://rabby.io/" },
  { name: "Coinbase Wallet", href: "https://www.coinbase.com/wallet/downloads" },
  { name: "Brave Wallet", href: "https://brave.com/wallet/" },
];

const SHOWCASE_CARDS = [
  { name: "Charizard", set: "Base Set", number: "#4/102", image: "/pokemon/base-set-charizard.webp" },
  { name: "Blastoise", set: "Base Set", number: "#2/102", image: "/pokemon/base-set-blastoise.webp" },
  { name: "Venusaur", set: "Base Set", number: "#15/102", image: "/pokemon/base-set-venusaur.webp" },
  { name: "Pikachu", set: "Base Set", number: "#58/102", image: "/pokemon/base-set-pikachu.webp" },
  { name: "Mewtwo", set: "Base Set", number: "#10/102", image: "/pokemon/base-set-mewtwo.webp" },
] as const;

const CAPABILITIES = [
  { value: "Atomic", title: "All-or-nothing settlement", copy: "Every route leg is designed to move together—or nothing moves." },
  { value: "1:1", title: "Redeemable digital titles", copy: "One onchain title represents one authenticated physical slab." },
  { value: "Wallet", title: "Self-custody by default", copy: "Connect through your own EVM provider without sharing private keys." },
  { value: "2", title: "Robinhood Chain environments", copy: "Mainnet for production and testnet for learning the flow." },
] as const;

const DEMO_STEPS = [
  {
    label: "Connect",
    title: "Connect the wallet you already use",
    copy: "Choose an installed EVM wallet and switch to Robinhood Chain. GrailRoute only requests account access—never your seed phrase.",
    signal: "Wallet authenticated",
    icon: Wallet,
  },
  {
    label: "Vault",
    title: "Turn a verified slab into an onchain title",
    copy: "An authenticated Pokémon card enters secure custody. Its digital title is issued 1:1 so ownership can move without shipping the slab for every trade.",
    signal: "Card title issued",
    icon: ShieldCheck,
  },
  {
    label: "Target",
    title: "Name the exact grail you want",
    copy: "Select the Pokémon, set, card number, and grade. Precise targets give the routing engine a cleaner path to search.",
    signal: "Target locked",
    icon: CardsThree,
  },
  {
    label: "Route",
    title: "Review the path—not just the destination",
    copy: "GrailRoute can surface a direct swap or a multi-party loop built from verified digital titles. Every leg stays visible before you approve it.",
    signal: "Route assembled",
    icon: Path,
  },
  {
    label: "Sign",
    title: "Approve once the terms are right",
    copy: "Confirm the network, assets, and route in your wallet. Atomic settlement is designed so the complete route settles together or nothing moves.",
    signal: "Ready to settle",
    icon: CheckCircle,
  },
] as const;

const USE_TIPS = [
  { number: "01", title: "Be specific", copy: "Use the exact Pokémon, set, number, and grade when setting a target." },
  { number: "02", title: "Vault first", copy: "Authenticated titles are what make a card eligible for onchain routing." },
  { number: "03", title: "Inspect every leg", copy: "Check each asset and participant before approving a multi-party route." },
  { number: "04", title: "Learn on testnet", copy: "Practice the wallet and signing flow on Robinhood Chain Testnet first." },
] as const;

const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatEth(hexBalance: string) {
  let value: bigint;
  try {
    value = BigInt(hexBalance || "0x0");
  } catch {
    // Some providers answer eth_getBalance with a bare "0x".
    return "0";
  }
  const unit = 10n ** 18n;
  const whole = value / unit;
  const fraction = (value % unit).toString().padStart(18, "0").slice(0, 5).replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""}`;
}

function chainFromId(chainId: number) {
  return Object.values(CHAINS).find((chain) => chain.id === chainId);
}

// Wallets disagree on where they put the EIP-1193 code: some nest it under
// data.originalError while reporting -32603 at the top level.
function errorCode(error: unknown) {
  if (typeof error !== "object" || !error) return 0;
  const record = error as { code?: unknown; data?: { originalError?: { code?: unknown } } };
  const raw = record.code ?? record.data?.originalError?.code;
  return typeof raw === "number" ? raw : 0;
}

function errorMessage(error: unknown) {
  if (errorCode(error) === 4001) return "The request was cancelled in your wallet.";
  if (error instanceof Error) return error.message;
  return "The wallet could not complete that request.";
}

async function requestChain(provider: EIP1193Provider, chain: (typeof CHAINS)[ChainKey]) {
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.hexId }] });
  } catch (error) {
    if (errorCode(error) !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: chain.hexId,
        chainName: chain.name,
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: [chain.rpcUrl],
        blockExplorerUrls: [chain.explorerUrl],
      }],
    });
    // EIP-3085: adding a chain does not mean the wallet switched to it.
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.hexId }] });
  }

  // Some wallets resolve the switch without changing networks, so confirm.
  const activeHex = await provider.request<string>({ method: "eth_chainId" });
  if (Number.parseInt(activeHex, 16) !== chain.id) {
    throw new Error(`Your wallet is still on another network. Switch to ${chain.name} to continue.`);
  }
}

function balanceOfCallData(address: string) {
  return `0x70a08231${address.toLowerCase().replace(/^0x/, "").padStart(64, "0")}`;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

// Sampling matchMedia once at mount would ignore the preference being changed
// mid-session, leaving carousels spinning for users who just asked them to stop.
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

function EmptyState({ icon, title, copy, action }: { icon: React.ReactNode; title: string; copy: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      {/* h3: subordinate to the workspace section heading, not a sibling of it. */}
      <h3>{title}</h3>
      <p>{copy}</p>
      {action}
    </div>
  );
}

function HeroShowcase() {
  const [activeCard, setActiveCard] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => setActiveCard((current) => (current + 1) % SHOWCASE_CARDS.length), 3200);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  // A deliberate pick has to stick, rather than being overwritten 3.2s later.
  function selectCard(index: number) {
    setActiveCard(index);
    setPaused(true);
  }

  return (
    <aside className="hero-showcase" aria-label="Illustrative Pokémon card references">
      <div className="showcase-label">
        <span>Pokémon TCG visual references</span>
        <button className="showcase-playback" onClick={() => setPaused((current) => !current)} aria-label={paused ? "Play card carousel" : "Pause card carousel"}>
          {paused ? <Play size={11} weight="fill" /> : <Pause size={11} weight="fill" />}
          {paused ? "Play" : "Pause"}
        </button>
      </div>
      <div className="showcase-stack">
        {SHOWCASE_CARDS.map((card, index) => {
          let offset = index - activeCard;
          if (offset > SHOWCASE_CARDS.length / 2) offset -= SHOWCASE_CARDS.length;
          if (offset < -SHOWCASE_CARDS.length / 2) offset += SHOWCASE_CARDS.length;
          const distance = Math.abs(offset);
          const style = {
            "--card-offset": offset,
            "--card-scale": distance === 0 ? 1 : distance === 1 ? .84 : .7,
            "--card-opacity": distance > 2 ? 0 : distance === 2 ? .38 : distance === 1 ? .76 : 1,
            "--card-z": 20 - distance,
            "--card-blur": `${distance >= 2 ? 2.5 : 0}px`,
          } as React.CSSProperties;
          return (
            <button key={card.name} className={`showcase-card ${distance === 0 ? "active" : ""}`} style={style} onClick={() => selectCard(index)} aria-label={`Show ${card.name} ${card.set}`} tabIndex={distance === 0 ? 0 : -1} aria-hidden={distance > 1 ? true : undefined}>
              <span className="showcase-slab">
                <span className="slab-header"><strong><SealCheck size={14} weight="fill" /> Base Set</strong><em>Reference</em></span>
                {/* No lazy loading: the carousel rotates every 3.2s, so a deferred
                    card shows an empty slab. All five are WebP and ~85KB each. */}
                <span className="slab-art"><img src={card.image} alt={`${card.name} Pokémon card from ${card.set}`} width={600} height={825} decoding="async" fetchPriority={index === 0 ? "high" : "low"} /></span>
                <span className="slab-meta"><strong>{card.name}</strong><em>{card.number}</em></span>
                {distance === 0 && <span className="slab-sheen" />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="showcase-badges"><span><ShieldCheck size={15} /> Illustrative only</span><span><Globe size={15} /> Live wallet data below</span></div>
      <div className="showcase-dots">{SHOWCASE_CARDS.map((card, index) => <button key={card.name} onClick={() => selectCard(index)} className={index === activeCard ? "active" : ""} aria-label={`Show ${card.name}`} aria-current={index === activeCard ? "true" : undefined} />)}</div>
      <p>Card imagery demonstrates the product concept and is not connected-wallet inventory.</p>
    </aside>
  );
}

function MotionFilm() {
  return (
    <section className="motion-film reveal-section" id="motion-film" aria-labelledby="motion-film-title">
      <div className="motion-film-heading">
        <div><span className="eyebrow"><PlayCircle size={17} weight="duotone" /> 15-second product story</span><h2 id="motion-film-title">From physical grail to onchain route.</h2></div>
        <div><p>A cinematic overview of vaulting, digital titles, route discovery, and atomic settlement on Robinhood Chain.</p><a href="/grailroute-motion-demo.mp4" download><DownloadSimple size={17} /> Download video</a></div>
      </div>
      <div className="motion-film-frame">
        <span className="film-corner film-corner-one" /><span className="film-corner film-corner-two" />
        <video controls muted playsInline preload="metadata" poster="/video/grailroute-motion-poster.jpg" aria-label="GrailRoute product motion graphic">
          <source src="/grailroute-motion-demo.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}

function ProductWalkthrough({ onConnect }: { onConnect: () => void }) {
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = DEMO_STEPS[activeStep];
  const ActiveIcon = active.icon;

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % DEMO_STEPS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  function selectStep(index: number) {
    setActiveStep(index);
    setPaused(true);
  }

  // Arrow/Home/End navigation, as the tab role leads users to expect.
  function onTabKeyDown(event: React.KeyboardEvent, index: number) {
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % DEMO_STEPS.length,
      ArrowDown: (index + 1) % DEMO_STEPS.length,
      ArrowLeft: (index - 1 + DEMO_STEPS.length) % DEMO_STEPS.length,
      ArrowUp: (index - 1 + DEMO_STEPS.length) % DEMO_STEPS.length,
      Home: 0,
      End: DEMO_STEPS.length - 1,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectStep(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="product-demo" id="how-it-works" aria-labelledby="demo-title">
      <header className="demo-heading">
        <div>
          <span className="eyebrow"><Path size={16} /> Product walkthrough</span>
          <h2 id="demo-title">See the complete journey before you sign.</h2>
          <p>Follow a Pokémon card from a self-custody wallet to an atomic GrailRoute settlement.</p>
        </div>
        <button className="demo-playback" onClick={() => setPaused((current) => !current)} aria-label={paused ? "Play walkthrough" : "Pause walkthrough"}>
          {paused ? <Play size={16} weight="fill" /> : <Pause size={16} weight="fill" />}
          {paused ? "Play demo" : "Pause demo"}
        </button>
      </header>

      <div className="demo-grid">
        <div className="demo-step-list" role="tablist" aria-label="GrailRoute product steps">
          {DEMO_STEPS.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <button
                key={step.label}
                role="tab"
                ref={(element) => { tabRefs.current[index] = element; }}
                id={`demo-tab-${index}`}
                aria-selected={activeStep === index}
                aria-controls="demo-stage-panel"
                // The visible label is hidden below 980px, so name the tab explicitly.
                aria-label={`Step ${index + 1}: ${step.label} — ${step.title}`}
                tabIndex={activeStep === index ? 0 : -1}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={activeStep === index ? "active" : ""}
                onClick={() => selectStep(index)}
              >
                <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="step-icon"><StepIcon size={20} /></span>
                <span><strong>{step.label}</strong><em>{step.title}</em></span>
                <ArrowRight className="step-arrow" size={17} />
              </button>
            );
          })}
        </div>

        <div className="demo-stage" id="demo-stage-panel" role="tabpanel" aria-labelledby={`demo-tab-${activeStep}`} tabIndex={0}>
          <div className="stage-topline">
            <span><span className="stage-live-dot" /> Guided product demo</span>
            <strong>Step {activeStep + 1} of {DEMO_STEPS.length}</strong>
          </div>
          <div className="route-map" aria-hidden="true">
            <span className="route-map-line"><span style={{ width: `${(activeStep / (DEMO_STEPS.length - 1)) * 100}%` }} /></span>
            <div className="route-map-nodes">
              {DEMO_STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return <span key={step.label} className={index < activeStep ? "complete" : index === activeStep ? "current" : ""}><StepIcon size={18} weight={index <= activeStep ? "fill" : "regular"} /></span>;
              })}
            </div>
          </div>
          <div className="stage-card" key={active.label}>
            <span className="stage-card-icon"><ActiveIcon size={32} weight="duotone" /></span>
            <span className="stage-signal"><CheckCircle size={14} weight="fill" /> {active.signal}</span>
            <h3>{active.title}</h3>
            <p>{active.copy}</p>
          </div>
          <div className="stage-footer">
            <span><ShieldCheck size={16} /> Clear terms before every signature</span>
            <button onClick={onConnect}>Try with your wallet <ArrowRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="use-guide">
        <div className="use-guide-title"><span>Best ways to use GrailRoute</span><p>Four habits for a cleaner, safer route.</p></div>
        {USE_TIPS.map((tip) => <article key={tip.number}><span>{tip.number}</span><h3>{tip.title}</h3><p>{tip.copy}</p></article>)}
      </div>
    </section>
  );
}

function WalletModal({
  wallets,
  preferredChain,
  setPreferredChain,
  connected,
  connectedWallet,
  address,
  chainId,
  balance,
  status,
  error,
  onConnect,
  onSwitch,
  onDisconnect,
  onClose,
}: {
  wallets: WalletDetail[];
  preferredChain: ChainKey;
  setPreferredChain: (chain: ChainKey) => void;
  connected: boolean;
  connectedWallet: WalletDetail | null;
  address: string;
  chainId: number | null;
  balance: string;
  status: "idle" | "connecting" | "switching";
  error: string;
  onConnect: (wallet: WalletDetail) => void;
  onSwitch: (chain: ChainKey) => void;
  onDisconnect: () => void;
  onClose: () => void;
}) {
  const activeChain = chainId ? chainFromId(chainId) : null;
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus in and keep it inside while open. Restoring it on close is the
  // opener's job: capturing it here would break under StrictMode's double
  // invocation, which re-captures after focus has already moved into the dialog.
  useEffect(() => {
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
        (element) => !element.hasAttribute("disabled") && element.offsetParent !== null,
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (active && !dialog.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="wallet-modal" role="dialog" aria-modal="true" aria-labelledby="wallet-title" ref={dialogRef}>
        <header className="modal-header">
          <div>
            <span className="eyebrow"><Wallet size={16} /> Self-custody wallet</span>
            <h2 id="wallet-title">{connected ? "Wallet connected" : "Connect an EVM wallet"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close wallet dialog" ref={closeRef}><X size={20} /></button>
        </header>

        {connected ? (
          <div className="connected-wallet-panel">
            <div className="wallet-identity">
              <span className="wallet-icon-large">
                {connectedWallet?.info.icon ? <img src={connectedWallet.info.icon} alt="" /> : <Wallet size={26} />}
              </span>
              <div><strong>{connectedWallet?.info.name ?? "EVM wallet"}</strong><button onClick={() => navigator.clipboard.writeText(address)}>{shortAddress(address)} <Copy size={14} /></button></div>
              <span className="connected-badge"><CheckCircle size={15} weight="fill" /> Connected</span>
            </div>
            <div className="wallet-facts">
              <div><span>Network</span><strong>{activeChain?.name ?? `Unsupported chain ${chainId ?? ""}`}</strong></div>
              {/* Off Robinhood Chain the balance is deliberately unread, so report
                  it as unavailable rather than asserting a zero we never checked. */}
              <div><span>Native balance</span><strong>{activeChain ? `${balance || "0"} ETH` : "Unavailable on this network"}</strong></div>
            </div>
            <div className="network-choice">
              <span>Switch network</span>
              <div>{(Object.keys(CHAINS) as ChainKey[]).map((key) => <button key={key} className={chainId === CHAINS[key].id ? "selected" : ""} onClick={() => onSwitch(key)} disabled={status === "switching"}>{CHAINS[key].shortName}{chainId === CHAINS[key].id && <Check size={13} />}</button>)}</div>
            </div>
            <button className="disconnect-button" onClick={onDisconnect}><Power size={17} /> Disconnect from GrailRoute</button>
          </div>
        ) : (
          <>
            <div className="network-choice">
              <span>Connect on</span>
              <div>{(Object.keys(CHAINS) as ChainKey[]).map((key) => <button key={key} className={preferredChain === key ? "selected" : ""} onClick={() => setPreferredChain(key)}>{CHAINS[key].shortName}{preferredChain === key && <Check size={13} />}</button>)}</div>
            </div>
            <div className="wallet-list">
              {wallets.length ? wallets.map((wallet) => (
                <button key={wallet.info.uuid} onClick={() => onConnect(wallet)} disabled={status === "connecting"}>
                  <span className="wallet-provider-icon">{wallet.info.icon ? <img src={wallet.info.icon} alt="" /> : <Wallet size={22} />}</span>
                  <span><strong>{wallet.info.name}</strong><em>Detected in this browser</em></span>
                  <ArrowRight size={18} />
                </button>
              )) : (
                <div className="no-wallet">
                  <Warning size={23} />
                  <div><strong>No browser wallet detected</strong><p>Install an EVM wallet, unlock it, and refresh this page.</p></div>
                </div>
              )}
            </div>
            {!wallets.length && <div className="wallet-downloads">{WALLET_DOWNLOADS.map((wallet) => <a key={wallet.name} href={wallet.href} target="_blank" rel="noreferrer">{wallet.name}<ArrowSquareOut size={13} /></a>)}</div>}
            <p className="wallet-safety"><ShieldCheck size={16} /> GrailRoute never asks for your seed phrase or private key. Connection requests come directly from your wallet.</p>
          </>
        )}
        {error && <div className="wallet-error" role="alert"><Warning size={17} /> {error}</div>}
      </section>
    </div>
  );
}

export default function Home() {
  const [wallets, setWallets] = useState<WalletDetail[]>([]);
  const [walletOpen, setWalletOpen] = useState(false);
  const [preferredChain, setPreferredChain] = useState<ChainKey>("mainnet");
  const [provider, setProvider] = useState<EIP1193Provider | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<WalletDetail | null>(null);
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "switching">("idle");
  const [error, setError] = useState("");
  const [section, setSection] = useState<Section>("portfolio");
  const [assetStatus, setAssetStatus] = useState<AssetStatus>(ASSET_CONTRACT ? "loading" : "unconfigured");
  const [assetBalance, setAssetBalance] = useState<bigint | null>(null);
  const restored = useRef(false);
  const refreshGeneration = useRef(0);
  const sectionTabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const openerRef = useRef<HTMLElement | null>(null);

  function onSectionTabKeyDown(event: React.KeyboardEvent, index: number) {
    const targets: Record<string, number> = {
      ArrowRight: (index + 1) % SECTIONS.length,
      ArrowLeft: (index - 1 + SECTIONS.length) % SECTIONS.length,
      Home: 0,
      End: SECTIONS.length - 1,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setSection(SECTIONS[next]);
    sectionTabRefs.current[next]?.focus();
  }

  const refreshAccount = useCallback(async (walletProvider: EIP1193Provider, account: string) => {
    // Every refresh invalidates the ones before it, so a slow reply can never
    // repopulate state for an account or wallet the user has already left.
    const generation = ++refreshGeneration.current;
    const stale = () => generation !== refreshGeneration.current;

    // Clear before the first await: otherwise the previous account's balances
    // stay on screen next to the new account's address.
    setBalance("");
    setAssetBalance(null);
    setAssetStatus(ASSET_CONTRACT ? "loading" : "unconfigured");

    let chainHex: string;
    let balanceHex: string;
    try {
      [chainHex, balanceHex] = await Promise.all([
        walletProvider.request<string>({ method: "eth_chainId" }),
        walletProvider.request<string>({ method: "eth_getBalance", params: [account, "latest"] }),
      ]);
    } catch (readError) {
      if (stale()) return;
      setAssetStatus(ASSET_CONTRACT ? "error" : "unconfigured");
      throw readError;
    }
    if (stale()) return;

    const nextChainId = Number.parseInt(chainHex, 16);
    setChainId(nextChainId);

    // Reads are routed through the wallet, so they answer for whatever network
    // it is on. Anything off Robinhood Chain is not GrailRoute data and must not
    // be rendered as though it were.
    if (!chainFromId(nextChainId)) {
      setAssetStatus("wrong-network");
      return;
    }
    setBalance(formatEth(balanceHex));

    if (!ASSET_CONTRACT) {
      setAssetStatus("unconfigured");
      setAssetBalance(null);
      return;
    }
    setAssetStatus("loading");
    try {
      const result = await walletProvider.request<string>({
        method: "eth_call",
        params: [{ to: ASSET_CONTRACT, data: balanceOfCallData(account) }, "latest"],
      });
      if (stale()) return;
      setAssetBalance(BigInt(result || "0x0"));
      setAssetStatus("ready");
    } catch {
      if (stale()) return;
      setAssetBalance(null);
      setAssetStatus("error");
    }
  }, []);

  useEffect(() => {
    const announce = (event: Event) => {
      const detail = (event as CustomEvent<WalletDetail>).detail;
      if (!detail?.provider?.request || !detail.info?.uuid) return;
      setWallets((current) => current.some((item) => item.info.uuid === detail.info.uuid) ? current : [...current, detail]);
    };
    window.addEventListener("eip6963:announceProvider", announce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    const legacy = (window as Window & { ethereum?: EIP1193Provider }).ethereum;
    const timer = window.setTimeout(() => {
      if (!legacy) return;
      setWallets((current) => current.some((item) => item.provider === legacy) ? current : [...current, {
        info: { uuid: "legacy-injected-wallet", name: "Browser wallet", icon: "", rdns: "injected.browser" },
        provider: legacy,
      }]);
    }, 250);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("eip6963:announceProvider", announce);
    };
  }, []);

  useEffect(() => {
    if (restored.current || !wallets.length) return;
    const remembered = window.localStorage.getItem("grailroute-wallet-rdns");
    if (!remembered) {
      restored.current = true;
      return;
    }
    const wallet = wallets.find((item) => item.info.rdns === remembered);
    // Wallets announce across several renders, so keep waiting rather than
    // burning the one-shot guard on a batch that lacks the remembered wallet.
    if (!wallet) return;
    restored.current = true;
    wallet.provider.request<string[]>({ method: "eth_accounts" }).then((accounts) => {
      if (!accounts[0]) return;
      setProvider(wallet.provider);
      setConnectedWallet(wallet);
      setAddress(accounts[0]);
      refreshAccount(wallet.provider, accounts[0]).catch(() => undefined);
    }).catch(() => undefined);
  }, [refreshAccount, wallets]);

  useEffect(() => {
    if (!provider) return;
    const accountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? args[0] as string[] : [];
      if (!accounts[0]) {
        refreshGeneration.current++;
        setAddress("");
        setProvider(null);
        setConnectedWallet(null);
        setChainId(null);
        setBalance("");
        setAssetBalance(null);
        setAssetStatus(ASSET_CONTRACT ? "loading" : "unconfigured");
        return;
      }
      setAddress(accounts[0]);
      refreshAccount(provider, accounts[0]).catch(() => setError("Unable to refresh wallet data."));
    };
    const chainChanged = () => address && refreshAccount(provider, address).catch(() => setError("Unable to refresh network data."));
    provider.on?.("accountsChanged", accountsChanged);
    provider.on?.("chainChanged", chainChanged);
    return () => {
      provider.removeListener?.("accountsChanged", accountsChanged);
      provider.removeListener?.("chainChanged", chainChanged);
    };
  }, [address, provider, refreshAccount]);

  const activeChain = chainId ? chainFromId(chainId) : null;
  const connected = Boolean(provider && address);

  async function connect(wallet: WalletDetail) {
    setStatus("connecting");
    setError("");
    try {
      const accounts = await wallet.provider.request<string[]>({ method: "eth_requestAccounts" });
      if (!accounts[0]) throw new Error("No account was returned by the wallet.");
      setProvider(wallet.provider);
      setConnectedWallet(wallet);
      setAddress(accounts[0]);
      window.localStorage.setItem("grailroute-wallet-rdns", wallet.info.rdns);
      let chainSwitchFailed = false;
      try {
        await requestChain(wallet.provider, CHAINS[preferredChain]);
      } catch (chainError) {
        chainSwitchFailed = true;
        setError(errorMessage(chainError));
      }
      await refreshAccount(wallet.provider, accounts[0]);
      // Hold the dialog open on a failed switch: closing it would hide the only
      // notice that the wallet is on a network GrailRoute cannot read.
      if (!chainSwitchFailed) {
        setWalletOpen(false);
        restoreOpenerFocus();
      }
    } catch (walletError) {
      setError(errorMessage(walletError));
    } finally {
      setStatus("idle");
    }
  }

  const switchNetwork = useCallback(async (target: ChainKey) => {
    if (!provider) return;
    setStatus("switching");
    setError("");
    try {
      await requestChain(provider, CHAINS[target]);
      setPreferredChain(target);
      if (address) await refreshAccount(provider, address);
    } catch (chainError) {
      setError(errorMessage(chainError));
    } finally {
      setStatus("idle");
    }
  }, [address, provider, refreshAccount]);

  const openWallet = useCallback(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    setWalletOpen(true);
  }, []);

  // Deferred: the background is still inert during this commit, so focusing the
  // opener any earlier is silently ignored.
  const restoreOpenerFocus = useCallback(() => {
    const opener = openerRef.current;
    openerRef.current = null;
    window.setTimeout(() => opener?.focus?.(), 0);
  }, []);

  // Stable identity: the dialog's focus-management effect depends on it, and a
  // new function each render would re-run the trap and steal focus back.
  const closeWallet = useCallback(() => {
    setWalletOpen(false);
    setError("");
    restoreOpenerFocus();
  }, [restoreOpenerFocus]);

  function disconnect() {
    refreshGeneration.current++;
    setProvider(null);
    setConnectedWallet(null);
    setAddress("");
    setChainId(null);
    setBalance("");
    setAssetBalance(null);
    setAssetStatus(ASSET_CONTRACT ? "loading" : "unconfigured");
    setError("");
    window.localStorage.removeItem("grailroute-wallet-rdns");
    setWalletOpen(false);
    restoreOpenerFocus();
  }

  const panel = useMemo(() => {
    if (!connected) {
      return <EmptyState icon={<Wallet size={28} />} title="Connect to load real onchain data" copy="Your Pokémon assets, routes, and activity remain private until you choose a wallet. No sample inventory is displayed." action={<button className="primary-button" onClick={openWallet}>Connect wallet <ArrowRight size={18} /></button>} />;
    }
    if (assetStatus === "wrong-network") {
      return <EmptyState icon={<Warning size={28} />} title="Switch to Robinhood Chain" copy="Your wallet is on a different network. GrailRoute only reads balances on Robinhood Chain, so nothing is shown rather than data from another chain." action={<button className="primary-button" onClick={() => switchNetwork(preferredChain)} disabled={status === "switching"}>Switch to {CHAINS[preferredChain].shortName} <ArrowRight size={18} /></button>} />;
    }
    if (section === "portfolio") {
      if (assetStatus === "unconfigured") return <EmptyState icon={<CardsThree size={28} />} title="No tokenized-card contract configured" copy="The wallet connection is live. Your authenticated Pokémon cards will appear here after the GrailRoute asset contract is deployed and configured." />;
      if (assetStatus === "loading") return <EmptyState icon={<ArrowsClockwise className="spin" size={28} />} title="Reading your tokenized cards" copy="GrailRoute is querying the configured asset contract through your wallet." />;
      if (assetStatus === "error") return <EmptyState icon={<Warning size={28} />} title="Asset contract could not be read" copy="Confirm the configured contract is deployed on the network currently selected in your wallet." />;
      if (assetBalance === 0n) return <EmptyState icon={<CardsThree size={28} />} title="No tokenized Pokémon cards in this wallet" copy="Vaulted cards minted to this address will appear automatically. GrailRoute does not add demo inventory." />;
      return <EmptyState icon={<CheckCircle size={28} />} title={`${assetBalance?.toString() ?? "0"} tokenized card${assetBalance === 1n ? "" : "s"} found`} copy="The onchain balance is live. Card-level metadata will populate when the GrailRoute indexer is connected." />;
    }
    if (section === "routes") return <EmptyState icon={<Path size={28} />} title="No routing contract configured" copy="Real trade routes will appear here after the settlement contract is deployed. Simulated counterparties and matches have been removed." />;
    return <EmptyState icon={<ClockCounterClockwise size={28} />} title="View verified wallet activity" copy="GrailRoute does not generate sample transactions. Use the Robinhood Chain explorer to review this address directly." action={activeChain ? <a className="secondary-button" href={`${activeChain.explorerUrl}/address/${address}`} target="_blank" rel="noreferrer">Open Blockscout <ArrowSquareOut size={16} /></a> : undefined} />;
  }, [activeChain, address, assetBalance, assetStatus, connected, openWallet, preferredChain, section, status, switchNetwork]);

  return (
    <>
    {/* inert while the dialog is open, so aria-modal is backed by real
        containment instead of only announcing it. */}
    <div className="app-shell" inert={walletOpen}>
      <header className="topbar">
        <button className="brand" onClick={() => setSection("portfolio")} aria-label="Go to GrailRoute home">
          <span className="brand-wordmark">Grail<strong>Route</strong></span>
          <small>Pokémon TCG marketplace</small>
        </button>
        <nav className="primary-nav" aria-label="Primary navigation">
          {SECTIONS.map((item) => <button key={item} className={section === item ? "nav-active" : ""} aria-current={section === item ? "true" : undefined} onClick={() => setSection(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
        </nav>
        <div className="network-state">
          <span className={connected && activeChain ? "network-dot live" : "network-dot"} />
          <span>{connected ? activeChain?.name ?? "Unsupported network" : "Robinhood Chain"}</span>
        </div>
        {/* aria-label survives the label being hidden at narrow widths. */}
        <button className={`wallet-button ${connected ? "wallet-connected" : ""}`} onClick={openWallet} aria-label={connected ? `Wallet connected: ${shortAddress(address)}. Manage wallet` : "Connect wallet"}>
          {connectedWallet?.info.icon ? <img src={connectedWallet.info.icon} alt="" /> : <Wallet size={19} />}
          <span>{connected ? shortAddress(address) : "Connect wallet"}</span>
          {connected && <CheckCircle size={16} weight="fill" />}
        </button>
      </header>

      <main>
        <section className="wallet-hero">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkle size={17} weight="fill" /> Wallet-native Pokémon TCG market</span>
            <h1>Trade your way<br />to the <span>grail.</span></h1>
            <p>Vault authenticated cards, hold a 1:1 redeemable title, and let intent-based routing move you toward the exact Pokémon card you want—settled atomically on Robinhood Chain.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={openWallet}>{connected ? "Manage wallet" : "Connect EVM wallet"} <ArrowRight size={19} /></button>
              <a className="text-link" href="#motion-film">Watch the story <PlayCircle size={17} /></a>
              <a className="text-link" href="#how-it-works">Explore the flow <ArrowRight size={15} /></a>
              <a className="text-link" href="https://docs.robinhood.com/chain/add-network-to-wallet/" target="_blank" rel="noreferrer">Robinhood Chain details <ArrowSquareOut size={15} /></a>
            </div>
            <div className="trust-row"><span><ShieldCheck size={17} /> Non-custodial</span><span><PlugsConnected size={17} /> EIP-6963 discovery</span><span><Globe size={17} /> Mainnet + testnet</span></div>
          </div>
          <HeroShowcase />
        </section>

        <section className="capability-strip reveal-section" aria-label="GrailRoute capabilities">{CAPABILITIES.map((item) => <article key={item.title}><strong>{item.value}</strong><h3>{item.title}</h3><p>{item.copy}</p></article>)}</section>

        <MotionFilm />

        <ProductWalkthrough onConnect={openWallet} />

        <section className="data-workspace">
          <div className="workspace-heading">
            <div><span className="eyebrow"><Globe size={16} /> Live wallet workspace</span><h2>{section[0].toUpperCase() + section.slice(1)}</h2></div>
            {connected && <div className="workspace-actions">
              <button onClick={() => navigator.clipboard.writeText(address)}><Copy size={16} /> Copy address</button>
              {activeChain && <a href={`${activeChain.explorerUrl}/address/${address}`} target="_blank" rel="noreferrer"><ArrowSquareOut size={16} /> Explorer</a>}
              {!activeChain && <button onClick={() => switchNetwork(preferredChain)}><ArrowsClockwise size={16} /> Switch network</button>}
            </div>}
          </div>
          <div className="section-tabs" role="tablist" aria-label="Wallet workspace sections">{SECTIONS.map((item, index) => <button role="tab" key={item} ref={(element) => { sectionTabRefs.current[index] = element; }} id={`section-tab-${item}`} aria-selected={section === item} aria-controls="data-panel" tabIndex={section === item ? 0 : -1} onKeyDown={(event) => onSectionTabKeyDown(event, index)} className={section === item ? "selected" : ""} onClick={() => setSection(item)}>{item === "portfolio" ? <CardsThree size={17} /> : item === "routes" ? <Path size={17} /> : <ClockCounterClockwise size={17} />}{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
          <div className="data-panel" id="data-panel" role="tabpanel" aria-labelledby={`section-tab-${section}`} tabIndex={0}>{panel}</div>
        </section>
      </main>

      <footer className="site-footer">
        <span><span className="network-dot" /> Wallet data is read directly from the selected EVM provider</span>
        <nav aria-label="Footer"><a href="https://docs.robinhood.com/chain/" target="_blank" rel="noreferrer">Chain docs</a><button onClick={openWallet}>Wallet</button></nav>
        <span>Independent third-party Pokémon TCG marketplace · No simulated assets or transactions.</span>
      </footer>
    </div>

    {walletOpen && <WalletModal wallets={wallets} preferredChain={preferredChain} setPreferredChain={setPreferredChain} connected={connected} connectedWallet={connectedWallet} address={address} chainId={chainId} balance={balance} status={status} error={error} onConnect={connect} onSwitch={switchNetwork} onDisconnect={disconnect} onClose={closeWallet} />}
    </>
  );
}
