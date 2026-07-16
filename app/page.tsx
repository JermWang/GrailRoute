"use client";

import {
  ArrowRight,
  ArrowsClockwise,
  CardsThree,
  Check,
  CheckCircle,
  ClockCounterClockwise,
  Copy,
  ArrowSquareOut,
  Globe,
  Path,
  PlugsConnected,
  Power,
  ShieldCheck,
  Sparkle,
  Wallet,
  Warning,
  X,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
type AssetStatus = "unconfigured" | "loading" | "ready" | "error";

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

const WALLET_DOWNLOADS = [
  { name: "MetaMask", href: "https://metamask.io/download" },
  { name: "Rabby", href: "https://rabby.io/" },
  { name: "Coinbase Wallet", href: "https://www.coinbase.com/wallet/downloads" },
  { name: "Brave Wallet", href: "https://brave.com/wallet/" },
];

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatEth(hexBalance: string) {
  const value = BigInt(hexBalance);
  const unit = 10n ** 18n;
  const whole = value / unit;
  const fraction = (value % unit).toString().padStart(18, "0").slice(0, 5).replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""}`;
}

function chainFromId(chainId: number) {
  return Object.values(CHAINS).find((chain) => chain.id === chainId);
}

function errorMessage(error: unknown) {
  if (typeof error === "object" && error && "code" in error && Number((error as { code?: unknown }).code) === 4001) {
    return "The request was cancelled in your wallet.";
  }
  if (error instanceof Error) return error.message;
  return "The wallet could not complete that request.";
}

async function requestChain(provider: EIP1193Provider, chain: (typeof CHAINS)[ChainKey]) {
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chain.hexId }] });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? Number((error as { code?: unknown }).code) : 0;
    if (code !== 4902) throw error;
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
  }
}

function balanceOfCallData(address: string) {
  return `0x70a08231${address.toLowerCase().replace(/^0x/, "").padStart(64, "0")}`;
}

function EmptyState({ icon, title, copy, action }: { icon: React.ReactNode; title: string; copy: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
      {action}
    </div>
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
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="wallet-modal" role="dialog" aria-modal="true" aria-labelledby="wallet-title">
        <header className="modal-header">
          <div>
            <span className="eyebrow"><Wallet size={16} /> Self-custody wallet</span>
            <h2 id="wallet-title">{connected ? "Wallet connected" : "Connect an EVM wallet"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close wallet dialog"><X size={20} /></button>
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
              <div><span>Native balance</span><strong>{balance || "0"} ETH</strong></div>
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

  const refreshAccount = useCallback(async (walletProvider: EIP1193Provider, account: string) => {
    const [chainHex, balanceHex] = await Promise.all([
      walletProvider.request<string>({ method: "eth_chainId" }),
      walletProvider.request<string>({ method: "eth_getBalance", params: [account, "latest"] }),
    ]);
    const nextChainId = Number.parseInt(chainHex, 16);
    setChainId(nextChainId);
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
      setAssetBalance(BigInt(result || "0x0"));
      setAssetStatus("ready");
    } catch {
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
    restored.current = true;
    const remembered = window.localStorage.getItem("grailroute-wallet-rdns");
    const wallet = wallets.find((item) => item.info.rdns === remembered);
    if (!wallet) return;
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
        setAddress("");
        setProvider(null);
        setConnectedWallet(null);
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
      try {
        await requestChain(wallet.provider, CHAINS[preferredChain]);
      } catch (chainError) {
        setError(errorMessage(chainError));
      }
      await refreshAccount(wallet.provider, accounts[0]);
      setWalletOpen(false);
    } catch (walletError) {
      setError(errorMessage(walletError));
    } finally {
      setStatus("idle");
    }
  }

  async function switchNetwork(target: ChainKey) {
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
  }

  function disconnect() {
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
  }

  const panel = useMemo(() => {
    if (!connected) {
      return <EmptyState icon={<Wallet size={28} />} title="Connect to load real onchain data" copy="Your Pokémon assets, routes, and activity remain private until you choose a wallet. No sample inventory is displayed." action={<button className="primary-button" onClick={() => setWalletOpen(true)}>Connect wallet <ArrowRight size={18} /></button>} />;
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
  }, [activeChain, address, assetBalance, assetStatus, connected, section]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setSection("portfolio")} aria-label="Go to GrailRoute home">
          <span className="brand-wordmark">Grail<strong>Route</strong></span>
          <small>Pokémon TCG marketplace</small>
        </button>
        <nav className="primary-nav" aria-label="Primary navigation">
          {(["portfolio", "routes", "activity"] as Section[]).map((item) => <button key={item} className={section === item ? "nav-active" : ""} onClick={() => setSection(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
        </nav>
        <div className="network-state">
          <span className={activeChain ? "network-dot live" : "network-dot"} />
          <span>{connected ? activeChain?.name ?? "Unsupported network" : "Robinhood Chain"}</span>
        </div>
        <button className={`wallet-button ${connected ? "wallet-connected" : ""}`} onClick={() => setWalletOpen(true)}>
          {connectedWallet?.info.icon ? <img src={connectedWallet.info.icon} alt="" /> : <Wallet size={19} />}
          <span>{connected ? shortAddress(address) : "Connect wallet"}</span>
          {connected && <CheckCircle size={16} weight="fill" />}
        </button>
      </header>

      <main>
        <section className="wallet-hero">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkle size={17} weight="fill" /> Wallet-native Pokémon TCG market</span>
            <h1>Your real onchain collection. No placeholders.</h1>
            <p>Connect an installed EVM wallet to read your authentic tokenized-card balance, switch to Robinhood Chain, and prepare for contract-backed trading.</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => setWalletOpen(true)}>{connected ? "Manage wallet" : "Connect EVM wallet"} <ArrowRight size={19} /></button>
              <a className="text-link" href="https://docs.robinhood.com/chain/add-network-to-wallet/" target="_blank" rel="noreferrer">Robinhood Chain details <ArrowSquareOut size={15} /></a>
            </div>
            <div className="trust-row"><span><ShieldCheck size={17} /> Non-custodial</span><span><PlugsConnected size={17} /> EIP-6963 discovery</span><span><Globe size={17} /> Mainnet + testnet</span></div>
          </div>
          <aside className="connection-card">
            <div className="connection-card-header"><span>Connection status</span><strong className={connected ? "success" : ""}>{connected ? "Live" : "Not connected"}</strong></div>
            <div className="connection-visual"><span className={connected ? "wallet-orb connected" : "wallet-orb"}><Wallet size={29} /></span><span className="connection-line" /><span className={activeChain ? "chain-orb connected" : "chain-orb"}>R</span></div>
            <dl>
              <div><dt>Wallet</dt><dd>{connectedWallet?.info.name ?? "Waiting for connection"}</dd></div>
              <div><dt>Address</dt><dd>{address ? shortAddress(address) : "—"}</dd></div>
              <div><dt>Network</dt><dd>{activeChain?.shortName ?? (connected ? "Unsupported" : "—")}</dd></div>
              <div><dt>Balance</dt><dd>{connected ? `${balance || "0"} ETH` : "—"}</dd></div>
            </dl>
          </aside>
        </section>

        <section className="data-workspace">
          <div className="workspace-heading">
            <div><span className="eyebrow"><Globe size={16} /> Live wallet workspace</span><h2>{section[0].toUpperCase() + section.slice(1)}</h2></div>
            {connected && <div className="workspace-actions">
              <button onClick={() => navigator.clipboard.writeText(address)}><Copy size={16} /> Copy address</button>
              {activeChain && <a href={`${activeChain.explorerUrl}/address/${address}`} target="_blank" rel="noreferrer"><ArrowSquareOut size={16} /> Explorer</a>}
              {!activeChain && <button onClick={() => switchNetwork(preferredChain)}><ArrowsClockwise size={16} /> Switch network</button>}
            </div>}
          </div>
          <div className="section-tabs" role="tablist">{(["portfolio", "routes", "activity"] as Section[]).map((item) => <button role="tab" aria-selected={section === item} key={item} className={section === item ? "selected" : ""} onClick={() => setSection(item)}>{item === "portfolio" ? <CardsThree size={17} /> : item === "routes" ? <Path size={17} /> : <ClockCounterClockwise size={17} />}{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
          <div className="data-panel">{panel}</div>
        </section>
      </main>

      <footer className="site-footer">
        <span><span className="network-dot" /> Wallet data is read directly from the selected EVM provider</span>
        <nav><a href="https://docs.robinhood.com/chain/" target="_blank" rel="noreferrer">Chain docs</a><button onClick={() => setWalletOpen(true)}>Wallet</button><button>Privacy</button></nav>
        <span>Independent third-party Pokémon TCG marketplace · No simulated assets or transactions.</span>
      </footer>

      {walletOpen && <WalletModal wallets={wallets} preferredChain={preferredChain} setPreferredChain={setPreferredChain} connected={connected} connectedWallet={connectedWallet} address={address} chainId={chainId} balance={balance} status={status} error={error} onConnect={connect} onSwitch={switchNetwork} onDisconnect={disconnect} onClose={() => { setWalletOpen(false); setError(""); }} />}
    </div>
  );
}
