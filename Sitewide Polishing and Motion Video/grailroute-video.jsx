/* GrailRoute — 15s motion graphic. Scenes for animations-v2 SceneStage. */
const { interpolate, Easing, clamp, SceneStage, TweaksPanel, TweakToggle, TweakColor, useTweaks } = window;
const R = React;
const F = (p, inp, out, e = Easing.linear) => interpolate(inp, out, e)(p);
const JAK = "'Plus Jakarta Sans', system-ui, sans-serif";
const IMG = {
  charizard: "/pokemon/base-set-charizard.png",
  blastoise: "/pokemon/base-set-blastoise.png",
  venusaur:  "/pokemon/base-set-venusaur.png",
  pikachu:   "/pokemon/base-set-pikachu.png",
  mewtwo:    "/pokemon/base-set-mewtwo.png",
};

const GRCfg = R.createContext({ accent: "#16c26f", showCaptions: true });

/* ---------- shared pieces ---------- */
function Backdrop({ localTime = 0, tint = 0 }) {
  const glow = 0.55 + 0.22 * Math.sin(localTime * 1.3);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden",
      background: "radial-gradient(circle at 78% 16%, rgba(46,158,255,.20), transparent 44%), radial-gradient(circle at 12% 92%, rgba(22,194,111,.13), transparent 46%), linear-gradient(160deg,#061a3d 0%,#04102a 55%,#061631 100%)" }}>
      <div style={{ position: "absolute", inset: 0, opacity: .5,
        backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
        backgroundSize: "74px 74px", backgroundPosition: `${localTime * 5}px ${localTime * 5}px`,
        maskImage: "radial-gradient(circle at 50% 46%, black, transparent 82%)", WebkitMaskImage: "radial-gradient(circle at 50% 46%, black, transparent 82%)" }} />
      <div style={{ position: "absolute", top: -280, right: -180, width: 800, height: 800, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(46,158,255,.22), transparent 68%)", opacity: glow }} />
      {tint > 0 && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 46%, rgba(22,194,111,.22), transparent 60%)", opacity: tint }} />}
    </div>
  );
}

function Slab({ cx, cy, w = 220, rot = 0, scale = 1, opacity = 1, img, accent = "#16c26f", grade = "PSA 10", label = "GEM MINT", sheen = 0, glow = 0 }) {
  const pad = w * 0.045;
  const headerH = w * 0.185;
  const cardW = w - pad * 2;
  const cardH = cardW / 0.717;
  const h = headerH + cardH + pad * 2 + w * 0.02;
  return (
    <div style={{ position: "absolute", left: cx, top: cy, width: w, height: h, opacity,
      transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${scale})`, transformOrigin: "center" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.06, overflow: "hidden",
        background: "linear-gradient(155deg,#12294d,#0a1c3a)", border: "1px solid rgba(255,255,255,.2)",
        boxShadow: `0 30px 64px rgba(0,0,0,.55), 0 0 ${46 * glow}px ${accent}${glow > 0 ? "aa" : "00"}` }}>
        <div style={{ position: "absolute", top: pad, left: pad, right: pad, height: headerH, display: "flex", alignItems: "center", justifyContent: "space-between", gap: w * 0.03 }}>
          <span style={{ padding: `${w * 0.02}px ${w * 0.05}px`, borderRadius: w * 0.028, background: accent, color: "#04102a", fontWeight: 800, fontSize: w * 0.072, fontFamily: JAK, letterSpacing: ".01em", whiteSpace: "nowrap" }}>{grade}</span>
          {label ? <span style={{ color: "#aecbe8", fontSize: w * 0.052, fontWeight: 700, fontFamily: JAK, letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span> : null}
        </div>
        <div style={{ position: "absolute", top: pad + headerH + w * 0.015, left: pad, right: pad, bottom: pad, borderRadius: w * 0.035, overflow: "hidden", background: "#040d20", border: "1px solid rgba(255,255,255,.08)" }}>
          {img
            ? <img src={img} crossOrigin="anonymous" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : <div style={{ width: "100%", height: "100%", background: `radial-gradient(circle at 50% 40%, ${accent}55, transparent 62%), linear-gradient(160deg,#0d2247,#081733)` }} />}
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.06, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: 0, width: "55%", height: "140%",
          transform: `translateX(${-150 + sheen * 340}%) skewX(-18deg)`, background: "linear-gradient(90deg,transparent,rgba(255,255,255,.30),transparent)" }} />
      </div>
    </div>
  );
}

const Eyebrow = ({ children, style }) => (
  <div style={{ fontFamily: JAK, fontWeight: 800, fontSize: 24, letterSpacing: ".2em", textTransform: "uppercase", ...style }}>{children}</div>
);
const Headline = ({ children, style }) => (
  <div style={{ fontFamily: JAK, fontWeight: 800, letterSpacing: "-.035em", color: "#f2f8ff", lineHeight: 1.02, ...style }}>{children}</div>
);

/* ---------- Scene 1 · Open ---------- */
function SceneOpen({ progress: p, localTime: lt }) {
  const { accent, showCaptions } = R.useContext(GRCfg);
  const wmO = F(p, [0.06, 0.34], [0, 1], Easing.easeOutCubic);
  const wmS = F(p, [0.06, 0.44], [0.82, 1], Easing.easeOutBack);
  const ebO = F(p, [0.16, 0.34], [0, 1]);
  const slabX = F(p, [0.1, 0.6], [1560, 1440], Easing.easeOutCubic);
  const slabY = F(p, [0.1, 0.62], [900, 540], Easing.easeOutCubic);
  const slabO = F(p, [0.1, 0.4], [0, 1]);
  const slabR = F(p, [0.1, 0.62], [4, -7], Easing.easeOutCubic);
  const sheen = F(p, [0.38, 0.88], [0, 1]);
  const capO = F(p, [0.52, 0.72], [0, 1]);
  const capY = F(p, [0.52, 0.72], [26, 0], Easing.easeOutCubic);
  const line = F(p, [0.42, 0.92], [0, 1], Easing.easeOutCubic);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop localTime={lt} />
      <Slab cx={slabX} cy={slabY} w={300} rot={slabR} opacity={slabO} img={IMG.charizard} accent={accent} sheen={sheen} glow={0.7} grade="BASE SET" label="CHARIZARD · #4/102" />
      {showCaptions && <Eyebrow style={{ position: "absolute", left: 168, top: 358, color: "#7fd8ab", opacity: ebO }}>Pokémon TCG&nbsp;&nbsp;·&nbsp;&nbsp;Built on Robinhood Chain</Eyebrow>}
      <div style={{ position: "absolute", left: 168, top: 392, transformOrigin: "left center", transform: `scale(${wmS})`, opacity: wmO }}>
        <Headline style={{ fontSize: 156, letterSpacing: "-.05em" }}>Grail<span style={{ color: accent }}>Route</span></Headline>
      </div>
      <div style={{ position: "absolute", left: 172, top: 588, height: 5, width: 560 * line, borderRadius: 5, background: `linear-gradient(90deg, ${accent}, #2E9EFF)`, boxShadow: `0 0 18px ${accent}bb` }} />
      {showCaptions && <div style={{ position: "absolute", left: 172, top: 622, fontFamily: JAK, fontWeight: 600, fontSize: 34, color: "#9fb8d8", opacity: capO, transform: `translateY(${capY}px)` }}>Your collection, truly onchain.</div>}
    </div>
  );
}

/* ---------- Scene 2 · Vault ---------- */
function SceneVault({ progress: p, localTime: lt }) {
  const { accent, showCaptions } = R.useContext(GRCfg);
  const slabY = F(p, [0.05, 0.4], [-260, 470], [Easing.easeOutCubic]);
  const slabO = F(p, [0.05, 0.2], [0, 1]);
  const sealO = F(p, [0.4, 0.54], [0, 1]);
  const sealS = F(p, [0.4, 0.58], [0.7, 1], Easing.easeOutBack);
  const conn = F(p, [0.44, 0.72], [0, 1], Easing.easeOutCubic);
  const panelO = F(p, [0.52, 0.72], [0, 1]);
  const panelS = F(p, [0.52, 0.76], [0.8, 1], Easing.easeOutBack);
  const bigO = F(p, [0.6, 0.78], [0, 1]);
  const hlO = F(p, [0.2, 0.4], [0, 1]);
  const hlY = F(p, [0.2, 0.4], [24, 0], Easing.easeOutCubic);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop localTime={lt} />
      {showCaptions && <Eyebrow style={{ position: "absolute", left: 168, top: 150, color: "#7fd8ab", opacity: hlO }}>01 · Vault</Eyebrow>}
      <Slab cx={560} cy={slabY} w={288} rot={0} opacity={slabO} img={IMG.blastoise} accent={accent} sheen={0.5} glow={0.5} grade="BASE SET" label="BLASTOISE · #2/102" />
      <div style={{ position: "absolute", left: 560, top: 640, transform: `translate(-50%,-50%) scale(${sealS})`, opacity: sealO,
        display: "inline-flex", alignItems: "center", gap: 10, padding: "12px 22px", borderRadius: 999, background: "rgba(22,194,111,.16)", border: `1px solid ${accent}88`, boxShadow: `0 0 30px ${accent}55`, whiteSpace: "nowrap" }}>
        <i className="ph-fill ph-shield-check" style={{ fontSize: 30, color: "#6ee7a8" }} />
        <span style={{ fontFamily: JAK, fontWeight: 800, fontSize: 24, color: "#c8f3db", letterSpacing: ".02em" }}>VAULTED · INSURED CUSTODY</span>
      </div>
      {/* connector */}
      <div style={{ position: "absolute", left: 730, top: 468, width: 420 * conn, height: 4, borderRadius: 4, background: `linear-gradient(90deg, ${accent}, #2E9EFF)`, boxShadow: `0 0 14px ${accent}aa` }} />
      <div style={{ position: "absolute", left: 730 + 420 * conn, top: 470, width: 16, height: 16, borderRadius: "50%", transform: "translate(-50%,-50%)", background: "#2E9EFF", boxShadow: "0 0 16px #2E9EFFcc", opacity: conn }} />
      {/* title panel */}
      <div style={{ position: "absolute", left: 1350, top: 470, transform: `translate(-50%,-50%) scale(${panelS})`, opacity: panelO,
        width: 460, padding: "34px 38px", borderRadius: 26, background: "linear-gradient(150deg, rgba(18,42,78,.92), rgba(9,26,52,.92))", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 34px 80px rgba(0,0,0,.5)" }}>
        <div style={{ fontFamily: JAK, fontWeight: 800, fontSize: 20, letterSpacing: ".18em", color: "#8fb0d6" }}>DIGITAL TITLE</div>
        <div style={{ fontFamily: JAK, fontWeight: 800, fontSize: 108, lineHeight: 1, letterSpacing: "-.04em", color: accent, opacity: bigO }}>1:1</div>
        <div style={{ marginTop: 6, fontFamily: JAK, fontWeight: 700, fontSize: 22, color: "#cfe0f4", letterSpacing: ".04em" }}>ERC-721 · REDEEMABLE</div>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 9, color: "#8fb0d6", fontFamily: JAK, fontWeight: 600, fontSize: 19 }}>
          <i className="ph ph-link-simple" style={{ fontSize: 22, color: accent }} /> Backed by the physical slab
        </div>
      </div>
      {showCaptions && <Headline style={{ position: "absolute", left: 0, right: 0, top: 878, textAlign: "center", fontSize: 62, opacity: hlO, transform: `translateY(${hlY}px)` }}>Vault a card. Mint a <span style={{ color: accent }}>1:1 title.</span></Headline>}
    </div>
  );
}

/* ---------- Scene 3 · Route ---------- */
function SceneRoute({ progress: p, localTime: lt }) {
  const { accent, showCaptions } = R.useContext(GRCfg);
  const hlO = F(p, [0.06, 0.24], [0, 1]);
  const hlY = F(p, [0.06, 0.24], [26, 0], Easing.easeOutCubic);
  const subO = F(p, [0.18, 0.36], [0, 1]);
  const draw = F(p, [0.24, 0.74], [0, 1], Easing.easeInOutCubic);
  const grailO = F(p, [0.12, 0.34], [0, 1]);
  const grailS = F(p, [0.12, 0.4], [0.78, 1], Easing.easeOutBack);
  const grailPulse = 1 + 0.03 * Math.sin(lt * 4) * clamp((p - 0.68) * 6, 0, 1);
  const topupO = F(p, [0.5, 0.62], [0, 1]);
  const topupS = F(p, [0.5, 0.66], [0.7, 1], Easing.easeOutBack);
  const checkO = clamp((p - 0.7) * 6, 0, 1);
  const node = (t0) => ({ o: F(p, [t0, t0 + 0.08], [0, 1]), s: F(p, [t0, t0 + 0.1], [0.4, 1], Easing.easeOutBack) });
  const n1 = node(0.3), n2 = node(0.46);
  const slabIn = (i) => F(p, [0.06 + i * 0.06, 0.3 + i * 0.06], [0, 1], Easing.easeOutBack);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop localTime={lt} />
      {showCaptions && <Headline style={{ position: "absolute", left: 168, top: 132, fontSize: 66, opacity: hlO, transform: `translateY(${hlY}px)` }}>Route toward the <span style={{ color: "#f2b544" }}>grail.</span></Headline>}
      {showCaptions && <div style={{ position: "absolute", left: 170, top: 226, fontFamily: JAK, fontWeight: 600, fontSize: 26, color: "#9fb8d8", opacity: subO }}>Direct swaps · multi-party loops · atomic settlement</div>}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 9px ${accent}aa)` }}>
        <defs>
          <linearGradient id="grRoute" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={accent} /><stop offset="1" stopColor="#2E9EFF" />
          </linearGradient>
        </defs>
        <path d="M470,700 C640,800 660,830 780,800 C980,752 980,430 1150,410 C1300,392 1330,560 1430,590"
          pathLength="1" fill="none" stroke="url(#grRoute)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray="1" strokeDashoffset={1 - draw} />
      </svg>
      {/* your titles cluster */}
      <div style={{ opacity: slabIn(0) }}><Slab cx={306} cy={585} w={146} rot={-12} img={IMG.venusaur} accent={accent} glow={0.25} grade="BASE" label="" /></div>
      <div style={{ opacity: slabIn(1) }}><Slab cx={372} cy={660} w={146} rot={-2} img={IMG.pikachu} accent={accent} glow={0.25} grade="BASE" label="" /></div>
      <div style={{ opacity: slabIn(2) }}><Slab cx={446} cy={738} w={146} rot={9} img={IMG.blastoise} accent={accent} glow={0.25} grade="BASE" label="" /></div>
      {/* via nodes */}
      {[[780, 800, n1], [1150, 410, n2]].map(([x, y, nd], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${nd.s})`, opacity: nd.o,
          width: 58, height: 58, borderRadius: "50%", background: "#0e2a52", border: "1px solid #4aa3ff", boxShadow: "0 0 22px rgba(46,158,255,.5)", display: "grid", placeItems: "center" }}>
          <i className="ph-fill ph-user-circle" style={{ fontSize: 30, color: "#8fc7ff" }} />
        </div>
      ))}
      {/* route signal */}
      <div style={{ position: "absolute", left: 930, top: 600, transform: `translate(-50%,-50%) scale(${topupS})`, opacity: topupO,
        display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 999, background: "rgba(242,181,68,.16)", border: "1px solid #f2b544", boxShadow: "0 0 26px rgba(242,181,68,.4)", whiteSpace: "nowrap" }}>
        <i className="ph-fill ph-path" style={{ fontSize: 26, color: "#f2b544" }} />
        <span style={{ fontFamily: JAK, fontWeight: 800, fontSize: 24, color: "#ffe4a8" }}>ATOMIC PATH</span>
      </div>
      {/* target grail */}
      <div style={{ transform: `scale(${grailPulse})`, transformOrigin: "1560px 560px" }}>
        <Slab cx={1560} cy={560} w={300} rot={5} scale={grailS} opacity={grailO} img={IMG.charizard} accent="#f2b544" glow={0.9} grade="BASE SET" label="GRAIL · CHARIZARD" />
      </div>
      <div style={{ position: "absolute", left: 1560, top: 388, transform: "translate(-50%,-50%)", opacity: checkO, width: 62, height: 62, borderRadius: "50%", background: accent, boxShadow: `0 0 30px ${accent}`, display: "grid", placeItems: "center" }}>
        <i className="ph-bold ph-check" style={{ fontSize: 38, color: "#04102a" }} />
      </div>
    </div>
  );
}

/* ---------- Scene 4 · Settle ---------- */
function SceneSettle({ progress: p, localTime: lt }) {
  const { accent, showCaptions } = R.useContext(GRCfg);
  const tint = F(p, [0.28, 0.46, 0.7], [0, 0.5, 0.12]);
  const conv = F(p, [0.05, 0.34], [0, 1], Easing.easeInCubic);
  const checkS = F(p, [0.3, 0.5], [0, 1], Easing.easeOutBack);
  const ringS = F(p, [0.32, 0.82], [0.3, 3.2]);
  const ringO = F(p, [0.32, 0.82], [0.6, 0]);
  const hlO = F(p, [0.46, 0.62], [0, 1]);
  const hlY = F(p, [0.46, 0.62], [26, 0], Easing.easeOutCubic);
  const badge = (i) => ({ o: F(p, [0.56 + i * 0.07, 0.72 + i * 0.07], [0, 1]), y: F(p, [0.56 + i * 0.07, 0.72 + i * 0.07], [22, 0], Easing.easeOutCubic) });
  const tokens = [[-1, "#16c26f", IMG.venusaur], [0, "#2E9EFF", IMG.pikachu], [1, "#f2b544", IMG.charizard]];
  const CX = 960, CY = 430;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop localTime={lt} tint={tint} />
      {tokens.map(([dir, col, im], i) => {
        const sx = CX + dir * 360, sy = CY - 210 + Math.abs(dir) * 70;
        const x = sx + (CX - sx) * conv, y = sy + (CY - sy) * conv;
        return <Slab key={i} cx={x} cy={y} w={128 * (1 - 0.55 * conv)} rot={dir * 12 * (1 - conv)} opacity={0.9 * (1 - conv)} img={im} accent={col} glow={0.3} grade="10" label="" />;
      })}
      <div style={{ position: "absolute", left: CX, top: CY, transform: "translate(-50%,-50%)", width: 190, height: 190, borderRadius: "50%", border: `4px solid ${accent}`, opacity: ringO * clamp(ringS, 0, 1), transformOrigin: "center", scale: ringS }} />
      <div style={{ position: "absolute", left: CX, top: CY, transform: `translate(-50%,-50%) scale(${checkS})`, width: 190, height: 190, borderRadius: "50%", background: `radial-gradient(circle at 40% 32%, #6ee7a8, ${accent})`, boxShadow: `0 0 60px ${accent}bb`, display: "grid", placeItems: "center" }}>
        <i className="ph-bold ph-check" style={{ fontSize: 110, color: "#04102a" }} />
      </div>
      {showCaptions && <Headline style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontSize: 74, opacity: hlO, transform: `translateY(${hlY}px)` }}>Settles <span style={{ color: accent }}>atomically.</span></Headline>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, display: "flex", justifyContent: "center", gap: 20 }}>
        {[["ph-fill ph-link", "ONCHAIN", "#f2b544"], ["ph-fill ph-lock-key", "ALL-OR-NOTHING", "#2E9EFF"]].map(([ic, tx, col], i) => {
          const b = badge(i);
          return <div key={i} style={{ opacity: b.o, transform: `translateY(${b.y}px)`, display: "inline-flex", alignItems: "center", gap: 10, padding: "13px 24px", borderRadius: 999, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.18)" }}>
            <i className={ic} style={{ fontSize: 26, color: col }} />
            <span style={{ fontFamily: JAK, fontWeight: 800, fontSize: 24, color: "#eaf3ff", letterSpacing: ".05em" }}>{tx}</span>
          </div>;
        })}
      </div>
    </div>
  );
}

/* ---------- Scene 5 · Ecosystem ---------- */
function SceneEco({ progress: p, localTime: lt }) {
  const { accent, showCaptions } = R.useContext(GRCfg);
  const hlO = F(p, [0.05, 0.24], [0, 1]);
  const hlY = F(p, [0.05, 0.24], [24, 0], Easing.easeOutCubic);
  const pillars = [
    ["ph-duotone ph-shield-check", "Authenticated", "Graded slabs, verified & imaged"],
    ["ph-duotone ph-package", "Redeemable", "Burn the title, get the card"],
    ["ph-duotone ph-wallet", "Non-custodial", "Your keys, your titles"],
    ["ph-duotone ph-link", "Robinhood Chain", "EVM settlement layer"],
  ];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop localTime={lt} />
      {showCaptions && <Headline style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontSize: 58, opacity: hlO, transform: `translateY(${hlY}px)` }}>An <span style={{ color: accent }}>ownership layer</span> for collectibles.</Headline>}
      <div style={{ position: "absolute", left: 160, right: 160, top: 420, display: "flex", justifyContent: "center", gap: 28 }}>
        {pillars.map(([ic, title, sub], i) => {
          const o = F(p, [0.1 + i * 0.1, 0.32 + i * 0.1], [0, 1]);
          const y = F(p, [0.1 + i * 0.1, 0.34 + i * 0.1], [40, 0], Easing.easeOutBack);
          return <div key={i} style={{ flex: 1, maxWidth: 360, opacity: o, transform: `translateY(${y}px)`, padding: "38px 30px", borderRadius: 24, background: "linear-gradient(155deg, rgba(18,42,78,.85), rgba(9,26,52,.85))", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 26px 60px rgba(0,0,0,.4)" }}>
            <div style={{ width: 78, height: 78, borderRadius: 20, background: "rgba(22,194,111,.14)", border: `1px solid ${accent}55`, display: "grid", placeItems: "center" }}>
              <i className={ic} style={{ fontSize: 42, color: "#6ee7a8" }} />
            </div>
            <div style={{ marginTop: 24, fontFamily: JAK, fontWeight: 800, fontSize: 30, letterSpacing: "-.02em", color: "#f2f8ff" }}>{title}</div>
            <div style={{ marginTop: 8, fontFamily: JAK, fontWeight: 500, fontSize: 20, lineHeight: 1.4, color: "#9fb8d8" }}>{sub}</div>
          </div>;
        })}
      </div>
    </div>
  );
}

/* ---------- Scene 6 · End ---------- */
function SceneEnd({ progress: p, localTime: lt }) {
  const { accent } = R.useContext(GRCfg);
  const wmO = F(p, [0.1, 0.4], [0, 1]);
  const wmS = F(p, [0.1, 0.42], [0.84, 1], Easing.easeOutBack);
  const drift = 1 + 0.008 * Math.sin(lt * 1.6);
  const tagO = F(p, [0.35, 0.58], [0, 1]);
  const tagY = F(p, [0.35, 0.58], [22, 0], Easing.easeOutCubic);
  const ul = F(p, [0.5, 0.92], [0, 1], Easing.easeInOutCubic);
  const disO = F(p, [0.58, 0.78], [0, 1]);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Backdrop localTime={lt} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 402, textAlign: "center", opacity: wmO, transform: `scale(${wmS * drift})` }}>
        <Headline style={{ fontSize: 150, letterSpacing: "-.05em" }}>Grail<span style={{ color: accent }}>Route</span></Headline>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 596, textAlign: "center", opacity: tagO, transform: `translateY(${tagY}px)`, fontFamily: JAK, fontWeight: 700, fontSize: 46, color: "#cfe0f4", letterSpacing: "-.01em" }}>Trade your way to the grail.</div>
      <div style={{ position: "absolute", left: "50%", top: 672, width: 420 * ul, height: 5, borderRadius: 5, transform: "translateX(-50%)", background: `linear-gradient(90deg, ${accent}, #2E9EFF)`, boxShadow: `0 0 16px ${accent}bb` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 726, textAlign: "center", opacity: disO, fontFamily: JAK, fontWeight: 500, fontSize: 19, color: "#6f89ad", letterSpacing: ".02em" }}>Independent third-party marketplace · Not affiliated with Pokémon or Robinhood.</div>
    </div>
  );
}

/* ---------- Preview soundtrack: generated ambient pad + female voiceover ---------- */
function AudioController() {
  const [on, setOn] = R.useState(false);
  const ref = R.useRef({});
  R.useEffect(() => () => stopAll(), []);
  const LINES = [
    [0.2, "Grail Route. Your Pok\u00e9mon collection \u2014 truly onchain."],
    [3.9, "Vault an authenticated card, and mint a one to one redeemable title."],
    [7.5, "Then route toward the grail you actually want."],
    [10.7, "Everything settles atomically on Robinhood Chain."],
    [13.1, "Grail Route. Trade your way to the grail."],
  ];
  function pickVoice() {
    const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    const pref = /(female|samantha|victoria|zira|karen|moira|tessa|serena|jenny|aria|sonia|libby|google uk english female)/i;
    return vs.find((v) => /^en/i.test(v.lang) && pref.test(v.name)) || vs.find((v) => /en-GB|en-US/i.test(v.lang)) || vs[0] || null;
  }
  function speak(text) {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    const v = ref.current.voice || pickVoice();
    if (v) u.voice = v;
    u.rate = 1.02; u.pitch = 1.08; u.volume = 0.95;
    speechSynthesis.speak(u);
  }
  function scheduleVO() { ref.current.timers = LINES.map(([t, txt]) => setTimeout(() => speak(txt), t * 1000)); }
  function loopVO() {
    scheduleVO();
    ref.current.loop = setInterval(() => { try { speechSynthesis.cancel(); } catch (e) {} scheduleVO(); }, 15000);
  }
  function startPad() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC(); ref.current.ctx = ctx;
    const master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);
    master.gain.setTargetAtTime(0.5, ctx.currentTime, 1.6);
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 860; filter.Q.value = 0.5; filter.connect(master);
    const notes = [130.81, 196.0, 246.94, 392.0];
    ref.current.nodes = [];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = i === 3 ? "triangle" : "sine"; o.frequency.value = f; o.detune.value = (i - 1.5) * 4;
      const g = ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(filter); o.start();
      g.gain.setTargetAtTime(i === 3 ? 0.05 : 0.09, ctx.currentTime, 2.2);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.04 + i * 0.012;
      const lg = ctx.createGain(); lg.gain.value = 0.03; lfo.connect(lg); lg.connect(g.gain); lfo.start();
      ref.current.nodes.push(o, lfo);
    });
  }
  function stopAll() {
    try { (ref.current.timers || []).forEach(clearTimeout); clearInterval(ref.current.loop); } catch (e) {}
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
    try {
      const c = ref.current.ctx;
      if (c) { const now = c.currentTime; (ref.current.nodes || []).forEach((n) => { try { n.stop(now + 0.4); } catch (e) {} }); setTimeout(() => { try { c.close(); } catch (e) {} }, 700); ref.current.ctx = null; }
    } catch (e) {}
  }
  function toggle() {
    if (on) { stopAll(); setOn(false); return; }
    ref.current.voice = pickVoice();
    if (window.speechSynthesis && !ref.current.voice) speechSynthesis.onvoiceschanged = () => { ref.current.voice = pickVoice(); };
    try { startPad(); } catch (e) {}
    loopVO();
    setOn(true);
  }
  return (
    <button onClick={toggle} title="Preview only \u2014 not captured in video export" style={{ position: "fixed", left: 20, bottom: 20, zIndex: 50, display: "inline-flex", alignItems: "center", gap: 9, padding: "11px 17px", borderRadius: 12, border: "1px solid rgba(255,255,255,.22)", background: on ? "rgba(22,194,111,.92)" : "rgba(7,20,40,.85)", color: "#fff", fontFamily: JAK, fontWeight: 700, fontSize: 14, cursor: "pointer", backdropFilter: "blur(8px)", boxShadow: "0 10px 30px rgba(0,0,0,.4)" }}>
      <i className={on ? "ph-fill ph-speaker-high" : "ph-fill ph-speaker-simple-slash"} style={{ fontSize: 20 }} />
      {on ? "Sound on" : "Play with sound"}
    </button>
  );
}

/* ---------- App ---------- */
function GRApp() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const cfg = { accent: t.accent, showCaptions: t.showCaptions };
  return (
    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: "#04102a" }}>
      <GRCfg.Provider value={cfg}>
        <SceneStage width={1920} height={1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#04102a">
          {{ Open: SceneOpen, Vault: SceneVault, Route: SceneRoute, Settle: SceneSettle, Ecosystem: SceneEco, End: SceneEnd }}
        </SceneStage>
      </GRCfg.Provider>
      <TweaksPanel>
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak("motionEditor", v)} />
        <TweakColor label="Accent" value={t.accent} options={["#16c26f", "#2E9EFF", "#087d3f", "#f2b544"]} onChange={(v) => setTweak("accent", v)} />
        <TweakToggle label="Captions" value={t.showCaptions} onChange={(v) => setTweak("showCaptions", v)} />
      </TweaksPanel>
      <AudioController />
    </div>
  );
}
window.GRApp = GRApp;
