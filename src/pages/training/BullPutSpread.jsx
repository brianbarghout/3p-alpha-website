import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";

// ── Constants ────────────────────────────────────────────────────────────────
const PREMIUM          = 0.70;
const FEES             = 2.80;
const SPREAD_WIDTH     = 5.00;
const POP              = 0.80;
const STARTING_BALANCE = 1000;
const MIN_TRADE_BP     = 430;
const MC_LINES         = 20;   // Monte Carlo background lines

const WIN_50PCT   = (PREMIUM * 0.50 * 100) - FEES;           // +$32.20
const WIN_EXPIRY  = (PREMIUM * 100) - FEES;                   // +$67.20
const LOSS_2X     = (PREMIUM * 100) + FEES;                   // $72.80
const LOSS_EXPIRY = ((SPREAD_WIDTH - PREMIUM) * 100) + FEES; // $432.80
const EV_2X       = (POP * WIN_50PCT) + ((1-POP) * -LOSS_2X);
const EV_NONE     = (POP * WIN_50PCT) + ((1-POP) * -LOSS_EXPIRY);

const VIEW_OPTIONS = [
  { label: "100 trades · ~1 year",  trades: 100 },
  { label: "200 trades · ~2 years", trades: 200 },
  { label: "300 trades · ~3 years", trades: 300 },
];

// ── Seeded random ─────────────────────────────────────────────────────────────
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; };
}

// ── Generate one sequence ─────────────────────────────────────────────────────
function generateTrades(seed, stopMode, totalTrades) {
  const rand = seededRandom(seed);
  const trades = [];
  let balance = STARTING_BALANCE;
  let stopped = false;

  for (let i = 1; i <= totalTrades; i++) {
    if (stopped || balance < MIN_TRADE_BP) {
      stopped = true;
      trades.push({ trade: i, pnl: 0, balance, isWin: null, active: false });
      continue;
    }
    const isWin = rand() < POP;
    const loss  = stopMode === "2x" ? LOSS_2X : LOSS_EXPIRY;
    const pnl   = isWin ? WIN_50PCT : -loss;
    balance     = Math.max(0, balance + pnl);
    trades.push({ trade: i, pnl, balance, isWin, active: true });
  }
  return trades;
}

// ── Drawdown calculation ──────────────────────────────────────────────────────
function calcDrawdown(trades) {
  let peak = STARTING_BALANCE;
  let maxDD = 0;
  let ddStart = 0, ddEnd = 0, peakIdx = 0;
  const balances = [STARTING_BALANCE, ...trades.map(t => t.balance)];
  balances.forEach((b, i) => {
    if (b > peak) { peak = b; peakIdx = i; }
    const dd = peak - b;
    if (dd > maxDD) { maxDD = dd; ddStart = peakIdx; ddEnd = i; }
  });
  return { maxDD, ddStart, ddEnd };
}

// ── 1,000-run stats ───────────────────────────────────────────────────────────
function run1000(stopMode, totalTrades) {
  const finals = [];
  let ruined = 0;
  for (let s = 1; s <= 1000; s++) {
    const trades = generateTrades(s, stopMode, totalTrades);
    finals.push(trades[totalTrades-1].balance);
    if (trades.some(t => !t.active)) ruined++;
  }
  finals.sort((a,b) => a-b);
  return {
    finals,
    up:     finals.filter(b => b >= STARTING_BALANCE).length,
    down:   finals.filter(b => b <  STARTING_BALANCE).length,
    ruined,
    best:   finals[finals.length-1],
    worst:  finals[0],
    median: finals[500],
    avg:    finals.reduce((a,b)=>a+b,0)/finals.length,
  };
}

// ── Streaks ───────────────────────────────────────────────────────────────────
function computeStreaks(trades) {
  const active = trades.filter(t => t.active);
  let curLoss=0,maxLoss=0,curWin=0,maxWin=0;
  for (const t of active) {
    if (!t.isWin) { curLoss++; curWin=0;  maxLoss=Math.max(maxLoss,curLoss); }
    else          { curWin++;  curLoss=0; maxWin =Math.max(maxWin, curWin);  }
  }
  return { curLoss, maxLoss, curWin, maxWin };
}

const C = {
  bg:"#0a0e1a", panel:"#111827", border:"#1e2a3a",
  win:"#10b981", loss:"#ef4444", winDim:"#064e3b", lossDim:"#450a0a",
  accent:"#f59e0b", text:"#e2e8f0", muted:"#64748b",
};
const MC_COLORS = ["#1e3a5f","#1e4a3a","#3a1e4a","#4a3a1e","#1e4a4a","#3a1e1e","#1e3a3a","#2a2a1e","#1e2a4a","#3a2a1e"];

function fmt(n) { return n>=0 ? `+$${Math.abs(n).toFixed(2)}` : `-$${Math.abs(n).toFixed(2)}`; }

// ── Equity Curve with Monte Carlo overlay ─────────────────────────────────────
function EquityCurve({ trades, mcLines, totalTrades }) {
  if (!trades.length) return null;

  const allBalances = [
    STARTING_BALANCE,
    ...trades.map(t => t.balance),
    ...mcLines.flatMap(seq => seq.map(t => t.balance)),
  ];
  const minB = Math.min(...allBalances, MIN_TRADE_BP - 50);
  const maxB = Math.max(...allBalances, STARTING_BALANCE + 50);
  const W=560, H=140, padL=52, padR=10, padT=10, padB=10;
  const range = maxB - minB || 1;
  const toX = (i, total) => padL + (i/total)*(W-padL-padR);
  const toY = b => padT + ((maxB - Math.max(0,b))/range)*(H-padT-padB);

  const startY = toY(STARTING_BALANCE);
  const ruinY  = toY(MIN_TRADE_BP);
  const showRuin = ruinY > startY+2 && ruinY < H-padB;
  const finalB  = trades[trades.length-1].balance;
  const color   = finalB >= STARTING_BALANCE ? C.win : C.loss;

  const mainPts = [STARTING_BALANCE, ...trades.map(t=>t.balance)]
    .map((b,i) => `${toX(i,totalTrades)},${toY(b)}`).join(" ");

  // Y-axis tick values — 5 evenly spaced
  const tickCount = 5;
  const ticks = Array.from({length: tickCount}, (_,i) => {
    const val = minB + (i / (tickCount-1)) * range;
    return { val: Math.round(val), y: toY(val) };
  }).reverse();

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block" }}>
      {/* Y-axis grid lines + labels */}
      {ticks.map(({val, y}) => (
        <g key={val}>
          <line x1={padL} y1={y} x2={W-padR} y2={y}
            stroke={C.border} strokeWidth="0.5" strokeDasharray="2,4"/>
          <text x={padL-4} y={y+3.5} textAnchor="end"
            fontSize="8.5" fill={C.muted} fontFamily="monospace">
            ${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
          </text>
        </g>
      ))}

      {/* Monte Carlo background lines */}
      {mcLines.map((seq, li) => {
        const pts = [STARTING_BALANCE, ...seq.map(t=>t.balance)]
          .map((b,i) => `${toX(i,totalTrades)},${toY(b)}`).join(" ");
        return <polyline key={li} points={pts} fill="none"
          stroke={MC_COLORS[li % MC_COLORS.length]} strokeWidth="0.8" opacity="0.5" strokeLinejoin="round"/>;
      })}

      {/* Ruin line */}
      {showRuin && <>
        <line x1={padL} y1={ruinY} x2={W-padR} y2={ruinY} stroke={C.loss} strokeWidth="1" strokeDasharray="5,3"/>
        <rect x={W-145} y={ruinY-12} width={135} height={12} fill={C.bg}/>
        <text x={W-padR} y={ruinY-2} textAnchor="end" fontSize="7.5" fill={C.loss} fontWeight="700">▼ Cannot trade below this</text>
      </>}

      {/* Start level dashed */}
      <line x1={padL} y1={startY} x2={W-padR} y2={startY} stroke={C.muted} strokeWidth="0.7" strokeDasharray="4,3"/>

      {/* Main curve fill */}
      <polygon points={`${padL},${startY} ${mainPts} ${toX(totalTrades,totalTrades)},${startY}`}
        fill={color} fillOpacity="0.12"/>

      {/* Main curve */}
      <polyline points={mainPts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>

      {/* Y-axis line */}
      <line x1={padL} y1={padT} x2={padL} y2={H-padB} stroke={C.border} strokeWidth="0.8"/>

      {/* Dots */}
      <circle cx={padL} cy={startY} r="3" fill={C.accent}/>
      <circle cx={toX(totalTrades,totalTrades)} cy={toY(finalB)} r="4" fill={color}/>
    </svg>
  );
}

// ── Distribution histogram ────────────────────────────────────────────────────
function DistributionChart({ finals }) {
  if (!finals.length) return null;
  const W=560, H=100, pad=8, padB=22, BINS=40;
  const min=finals[0], max=finals[finals.length-1];
  const binW=(max-min)/BINS||1;
  const bins=Array(BINS).fill(0);
  finals.forEach(b=>{ const i=Math.min(BINS-1,Math.floor((b-min)/binW)); bins[i]++; });
  const maxC=Math.max(...bins);
  const barW=(W-pad*2)/BINS;
  const zeroX=pad+((STARTING_BALANCE-min)/(max-min))*(W-pad*2);
  const chartH = H - padB;

  // X axis ticks — 6 evenly spaced dollar values
  const tickCount = 6;
  const ticks = Array.from({length: tickCount}, (_,i) => {
    const val = min + (i/(tickCount-1))*(max-min);
    const x   = pad + (i/(tickCount-1))*(W-pad*2);
    return { val: Math.round(val), x };
  });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:"block" }}>
      {/* Bars */}
      {bins.map((c,i)=>{
        const x=pad+i*barW, mid=min+(i+0.5)*binW;
        const h=c?Math.max(3,(c/maxC)*(chartH-pad)):0;
        return <rect key={i} x={x+0.5} y={chartH-h} width={Math.max(1,barW-1)} height={h}
          fill={mid>=STARTING_BALANCE?C.win:C.loss} opacity={0.75} rx={1}/>;
      })}
      {/* Start balance gold line */}
      <line x1={zeroX} y1={pad} x2={zeroX} y2={chartH} stroke={C.accent} strokeWidth="1.5" strokeDasharray="4,2"/>
      {/* X axis baseline */}
      <line x1={pad} y1={chartH} x2={W-pad} y2={chartH} stroke={C.border} strokeWidth="0.8"/>
      {/* X axis tick marks and labels */}
      {ticks.map(({val,x})=>(
        <g key={val}>
          <line x1={x} y1={chartH} x2={x} y2={chartH+3} stroke={C.muted} strokeWidth="0.8"/>
          <text x={x} y={H-2} textAnchor="middle" fontSize="8" fill={C.muted} fontFamily="monospace">
            ${val>=1000?`${(val/1000).toFixed(1)}k`:val}
          </text>
        </g>
      ))}
      {/* Gold line label */}
      <rect x={zeroX+3} y={pad} width={38} height={11} fill={C.bg}/>
      <text x={zeroX+5} y={pad+8} fontSize="7.5" fill={C.accent} fontWeight="700">$1,000 start</text>
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BullPutSpread() {
  const [stopMode,    setStopMode]    = useState("2x");
  const [seed,        setSeed]        = useState(42);
  const [tradeView,   setTradeView]   = useState(0); // index into VIEW_OPTIONS
  const [animIdx,     setAnimIdx]     = useState(null); // null = show all
  const [animating,   setAnimating]   = useState(false);
  const [speed,       setSpeed]       = useState(600);
  const [showInfo,    setShowInfo]    = useState(false);
  const [showDist,    setShowDist]    = useState(false);
  const [showMC,      setShowMC]      = useState(true);
  const [flash,       setFlash]       = useState(false);
  const animRef  = useRef(null);
  const speedRef = useRef(600);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => () => clearTimeout(animRef.current), []);

  const totalTrades = VIEW_OPTIONS[tradeView].trades;

  // Regenerate whenever seed/stopMode/totalTrades changes
  const allTrades = useMemo(() =>
    generateTrades(seed, stopMode, totalTrades),
    [seed, stopMode, totalTrades]
  );

  // Monte Carlo lines (19 other seeds)
  const mcLines = useMemo(() =>
    Array.from({length: MC_LINES}, (_,i) =>
      generateTrades(seed + i + 1, stopMode, totalTrades)
    ),
    [seed, stopMode, totalTrades]
  );

  // 1000-run distribution
  const dist = useMemo(() => run1000(stopMode, totalTrades), [stopMode, totalTrades]);

  const shown = animIdx === null ? totalTrades : animIdx;
  const shownData = allTrades.slice(0, Math.max(0, shown));
  const activeSeen = shownData.filter(t => t.active);
  const wins       = activeSeen.filter(t => t.isWin).length;
  const losses     = activeSeen.filter(t => !t.isWin).length;
  const lossAmt    = stopMode === "2x" ? LOSS_2X : LOSS_EXPIRY;
  const totalWon   = wins * WIN_50PCT;
  const totalLost  = losses * lossAmt;
  const balance    = shownData.length ? shownData[shownData.length-1].balance : STARTING_BALANCE;
  const isUp       = balance >= STARTING_BALANCE;
  const isRuined   = shownData.some(t => !t.active);
  const ev         = stopMode === "2x" ? EV_2X : EV_NONE;
  const streaks    = computeStreaks(shownData);
  const drawdown   = calcDrawdown(shownData);
  const logTrades  = shownData.slice(-10).reverse();

  // Reset animIdx when dependencies change
  useEffect(() => { setAnimIdx(null); setAnimating(false); clearTimeout(animRef.current); }, [seed, stopMode, totalTrades]);

  function runAnimation() {
    clearTimeout(animRef.current);
    setAnimIdx(0); setAnimating(true); setFlash(false);
    let i = 0;
    const tick = () => {
      i++;
      setAnimIdx(i);
      const t = allTrades[i-1];
      if (t && t.active && !t.isWin) { setFlash(true); setTimeout(()=>setFlash(false),300); }
      if (i < totalTrades) animRef.current = setTimeout(tick, speedRef.current);
      else setAnimating(false);
    };
    animRef.current = setTimeout(tick, speedRef.current);
  }

  function randomize() {
    clearTimeout(animRef.current);
    setAnimating(false); setFlash(false); setAnimIdx(null);
    setSeed(Math.floor(Math.random()*999999));
  }

  const card = (x={}) => ({ background:C.panel, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", ...x });
  const lbl  = { fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 };
  const bigN = col => ({ fontSize:20, fontWeight:800, fontFamily:"monospace", color:col });
  const shownCount = animIdx === null ? totalTrades : animIdx;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"system-ui,sans-serif", padding:"10px 12px", boxSizing:"border-box" }}>

      {/* ══ TITLE + ℹ ══════════════════════════════════════════════════════ */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <div>
          <Link to="/training" style={{ fontSize:11, color:C.muted, textDecoration:"none", marginRight:12 }}>← Training</Link>
          <span style={{ fontSize:11, color:C.accent, textTransform:"uppercase", letterSpacing:"0.12em" }}>3PAC Training Library &nbsp;·&nbsp; </span>
          <span style={{ fontSize:16, fontWeight:800, color:C.text }}>Bull Put Spread Simulation</span>
        </div>
        <div style={{ position:"relative", flexShrink:0, marginLeft:12 }}>
          <button onClick={()=>setShowInfo(v=>!v)} style={{ background:showInfo?C.accent:"transparent", border:`2px solid ${C.accent}`, color:showInfo?"#000":C.accent, borderRadius:10, width:44, height:44, fontSize:22, fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:showInfo?`0 0 12px ${C.accent}88`:`0 0 8px ${C.accent}44` }}>ℹ</button>
          {showInfo && (
            <div style={{ position:"absolute", top:52, right:0, zIndex:100, width:300, background:C.panel, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", boxShadow:"0 8px 32px rgba(0,0,0,0.7)" }}>
              <div style={{ fontSize:11, color:C.accent, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>How Each Trade Works</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ background:C.winDim, border:`1px solid ${C.win}`, borderRadius:6, padding:"8px 10px", fontSize:12, color:C.win, lineHeight:1.6 }}>
                  <strong>✓ Win:</strong> Spread drops 50%. Bought back at $0.35 (sold $0.70). Profit = $0.35×100 = $35 − $2.80 fees = <strong>+$32.20</strong>. Closed immediately.
                </div>
                <div style={{ background:stopMode==="2x"?C.winDim:C.lossDim, border:`1px solid ${stopMode==="2x"?C.win:C.loss}`, borderRadius:6, padding:"8px 10px", fontSize:12, color:stopMode==="2x"?C.win:C.loss, lineHeight:1.6 }}>
                  {stopMode==="2x"
                    ? <span><strong>✓ Loss:</strong> Stop triggered. Bought back at $1.40. Premium $0.70. Net = $0.70×100=$70 + $2.80 fees = <strong>−$72.80</strong>. 2× Premium is the stop signal.</span>
                    : <span><strong>✗ Loss:</strong> No stop. Full $5 width at expiry. Loss = ($5−$0.70)×100=$430 + $2.80 fees = <strong>−$432.80</strong>.</span>
                  }
                </div>
                <div style={{ background:stopMode==="2x"?C.winDim:C.lossDim, border:`1px solid ${stopMode==="2x"?C.win:C.loss}`, borderRadius:6, padding:"7px 10px", fontSize:12, color:stopMode==="2x"?C.win:C.loss }}>
                  {stopMode==="2x"
                    ? `EV: (80%×$32.20)+(20%×−$72.80) = +$${EV_2X.toFixed(2)}/trade`
                    : `EV: (80%×$32.20)+(20%×−$432.80) = −$${Math.abs(EV_NONE).toFixed(2)}/trade`
                  }
                </div>
                <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", fontSize:12, color:C.muted }}>
                  <strong style={{ color:C.text }}>Ruin rule:</strong> Balance below $430 = IBKR blocks next trade. Simulation stops immediately.
                </div>
                <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 10px", fontSize:12, color:C.muted }}>
                  <strong style={{ color:C.accent }}>Monte Carlo lines:</strong> The faint background curves show 20 other possible outcomes using the same strategy but different random sequences. Your highlighted sequence is the bright line.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ BAND 1: Trade conditions ══════════════════════════════════════ */}
      <div style={{ background:"#0d1424", border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 14px", marginBottom:8, display:"flex", flexWrap:"wrap", gap:"4px 20px", alignItems:"center" }}>
        <span style={{ fontSize:13, fontWeight:800, color:C.accent }}>SPY Bull Put Spread</span>
        {[["Short Put","$700"],["Long Put","$695"],["Spread Width","$5.00"],["Delta","0.20"]].map(([k,v])=>(
          <span key={k} style={{ fontSize:12, color:C.muted }}>{k} <span style={{ color:C.text, fontWeight:700 }}>{v}</span></span>
        ))}
        <span style={{ fontSize:12, color:C.muted }}>POP <span style={{ color:C.win, fontWeight:700 }}>80%</span></span>
        <span style={{ fontSize:12, color:C.muted }}>Premium <span style={{ color:C.accent, fontWeight:700 }}>$0.70 ($70)</span></span>
        <span style={{ fontSize:12, color:C.muted }}>DTE <span style={{ color:C.text, fontWeight:700 }}>30</span></span>
        <span style={{ fontSize:12, color:C.muted }}>Account <span style={{ color:C.text, fontWeight:700 }}>$1,000</span></span>
      </div>

      {/* ══ BAND 2: 4-outcome grid ════════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:6, marginBottom:8 }}>
        {[
          ["Max Profit · At Expiry", `+$${WIN_EXPIRY.toFixed(2)}`,  C.win,  "Keep full credit · $70−$2.80"],
          ["Max Profit · 50% Exit",  `+$${WIN_50PCT.toFixed(2)}`,   C.win,  "Buy back at $0.35 · $35−$2.80"],
          ["Max Loss · 2× Stop",     `−$${LOSS_2X.toFixed(2)}`,     C.loss, "Stop at $1.40 · $70+$2.80"],
          ["Max Loss · At Expiry",   `−$${LOSS_EXPIRY.toFixed(2)}`, C.loss, "Full $5 width · $430+$2.80"],
        ].map(([l,v,col,note])=>(
          <div key={l} style={{ ...card(), borderTop:`2px solid ${col}` }}>
            <div style={lbl}>{l}</div>
            <div style={bigN(col)}>{v}</div>
            <div style={{ fontSize:10, color:C.muted, marginTop:3, lineHeight:1.5 }}>{note}</div>
          </div>
        ))}
      </div>

      {/* ══ BAND 3: Controls ══════════════════════════════════════════════ */}
      <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap", alignItems:"center" }}>
        {/* Time horizon */}
        <span style={{ fontSize:11, color:C.muted }}>View:</span>
        <div style={{ display:"flex", gap:3, background:C.panel, border:`1px solid ${C.border}`, borderRadius:7, padding:3 }}>
          {VIEW_OPTIONS.map((opt,i)=>(
            <button key={i} onClick={()=>setTradeView(i)} style={{ background:tradeView===i?C.accent:"transparent", border:"none", color:tradeView===i?"#000":C.muted, borderRadius:5, padding:"5px 10px", cursor:"pointer", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>{opt.label}</button>
          ))}
        </div>

        {/* Take profit */}
        <span style={{ fontSize:11, color:C.muted, marginLeft:4 }}>Take profit:</span>
        <div style={{ background:C.winDim, border:`1px solid ${C.win}`, borderRadius:6, padding:"5px 10px", fontSize:12, fontWeight:700, color:C.win }}>50% of Premium</div>

        {/* Stop loss */}
        <span style={{ fontSize:11, color:C.muted, marginLeft:4 }}>Stop loss:</span>
        <div style={{ display:"flex", gap:3, background:C.panel, border:`1px solid ${C.border}`, borderRadius:7, padding:3 }}>
          {[["2x","2× Premium"],["none","None"]].map(([val,l2])=>(
            <button key={val} onClick={()=>setStopMode(val)} style={{ background:stopMode===val?(val==="2x"?C.winDim:C.lossDim):"transparent", border:stopMode===val?`1px solid ${val==="2x"?C.win:C.loss}`:"1px solid transparent", color:stopMode===val?(val==="2x"?C.win:C.loss):C.muted, borderRadius:5, padding:"5px 10px", cursor:"pointer", fontSize:12, fontWeight:700 }}>{l2}</button>
          ))}
        </div>

        <div style={{ width:1, height:24, background:C.border, margin:"0 2px" }}/>

        {/* Animate */}
        <button onClick={runAnimation} disabled={animating} style={{ background:C.accent, color:"#000", border:"none", borderRadius:7, padding:"7px 14px", fontWeight:800, fontSize:12, cursor:animating?"not-allowed":"pointer", opacity:animating?0.6:1 }}>
          {animating?`▶ ${animIdx}/${totalTrades}`:"▶ Animate"}
        </button>
        <button onClick={randomize} disabled={animating} style={{ background:C.panel, color:C.text, border:`1px solid ${C.border}`, borderRadius:7, padding:"7px 12px", fontWeight:700, fontSize:12, cursor:animating?"not-allowed":"pointer" }}>↻ New Sequence</button>
        <button onClick={()=>{ clearTimeout(animRef.current); setAnimating(false); setAnimIdx(null); }} style={{ background:C.panel, color:C.muted, border:`1px solid ${C.border}`, borderRadius:7, padding:"7px 12px", fontWeight:700, fontSize:12, cursor:"pointer" }}>⏭ Skip to End</button>

        {/* MC toggle */}
        <button onClick={()=>setShowMC(v=>!v)} style={{ background:showMC?"#1e3a5f":C.panel, color:showMC?"#60a5fa":C.muted, border:`1px solid ${showMC?"#60a5fa":C.border}`, borderRadius:7, padding:"7px 10px", fontWeight:700, fontSize:11, cursor:"pointer", whiteSpace:"nowrap" }}>
          {showMC?"◉ Monte Carlo ON":"○ Monte Carlo OFF"}
        </button>

        <div style={{ display:"flex", gap:4, alignItems:"center", marginLeft:"auto" }}>
          <span style={{ fontSize:11, color:C.muted }}>Speed:</span>
          {[["Slow",1200],["Med",600],["Fast",120]].map(([l,v])=>(
            <button key={v} onClick={()=>setSpeed(v)} style={{ background:speed===v?C.accent:C.bg, color:speed===v?"#000":C.muted, border:`1px solid ${speed===v?C.accent:C.border}`, borderRadius:5, padding:"4px 8px", fontSize:11, cursor:"pointer", fontWeight:700 }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ══ REWIND ROW ════════════════════════════════════════════════════ */}
      <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:8, background:C.panel, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 12px" }}>
        <span style={{ fontSize:11, color:C.muted }}>Step:</span>
        <button onClick={()=>{ clearTimeout(animRef.current); setAnimating(false); setAnimIdx(0); }} style={{ background:C.bg, color:C.accent, border:`1px solid ${C.accent}`, borderRadius:6, padding:"5px 10px", fontWeight:800, fontSize:15, cursor:"pointer" }}>⏮</button>
        <button onClick={()=>{ clearTimeout(animRef.current); setAnimating(false); setAnimIdx(i=>(i===null?totalTrades-1:Math.max(0,i-1))); }} style={{ background:C.bg, color:C.text, border:`1px solid ${C.text}`, borderRadius:6, padding:"5px 12px", fontWeight:800, fontSize:15, cursor:"pointer" }}>◀</button>
        <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"4px 12px", fontFamily:"monospace", fontSize:14, fontWeight:700, color:C.accent, minWidth:72, textAlign:"center" }}>{shownCount}/{totalTrades}</div>
        <button onClick={()=>{ clearTimeout(animRef.current); setAnimating(false); setAnimIdx(i=>(i===null||i>=totalTrades?null:i+1)); }} style={{ background:C.bg, color:C.text, border:`1px solid ${C.text}`, borderRadius:6, padding:"5px 12px", fontWeight:800, fontSize:15, cursor:"pointer" }}>▶</button>
        <button onClick={()=>{ clearTimeout(animRef.current); setAnimating(false); setAnimIdx(null); }} style={{ background:C.bg, color:C.accent, border:`1px solid ${C.accent}`, borderRadius:6, padding:"5px 10px", fontWeight:800, fontSize:15, cursor:"pointer" }}>⏭</button>
        <span style={{ fontSize:10, color:C.muted, marginLeft:4 }}>◀ ▶ step one trade at a time</span>
      </div>

      {/* ══ BAND 4: Stats ═════════════════════════════════════════════════ */}
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>
        {[
          ["Trades",       `${shownCount}/${totalTrades}`,      C.text],
          ["Active",       activeSeen.length,                   C.text],
          ["Winners",      wins,                                C.win],
          ["Losers",       losses,                              C.loss],
          ["Won",          `+$${totalWon.toFixed(0)}`,          C.win],
          ["Lost",         `-$${totalLost.toFixed(0)}`,         C.loss],
          ["Balance",      `$${balance.toFixed(0)}`,            isRuined?C.loss:isUp?C.win:C.loss],
          ["Net P&L",      fmt(balance-STARTING_BALANCE),       isUp?C.win:C.loss],
          ["Max Drawdown", `-$${drawdown.maxDD.toFixed(0)}`,    drawdown.maxDD>200?C.loss:drawdown.maxDD>100?C.accent:C.muted],
        ].map(([l,v,col])=>(
          <div key={l} style={{ ...card({flex:1,minWidth:70}), ...(l==="Balance"&&isRuined?{border:`1px solid ${C.loss}`}:{}), ...(l==="Max Drawdown"?{borderTop:`2px solid ${drawdown.maxDD>200?C.loss:drawdown.maxDD>100?C.accent:C.border}`}:{}) }}>
            <div style={lbl}>{l}</div>
            <div style={bigN(col)}>{v}</div>
            {l==="Max Drawdown" && drawdown.maxDD>0 && (
              <div style={{ fontSize:9, color:C.muted, marginTop:2 }}>
                {drawdown.maxDD>200?"⚠ Would you hold?":drawdown.maxDD>100?"Uncomfortable":"Normal variance"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ruin banner */}
      {isRuined && (
        <div style={{ background:C.lossDim, border:`1px solid ${C.loss}`, borderRadius:8, padding:"7px 14px", marginBottom:8, fontSize:13, color:C.loss, fontWeight:700 }}>
          ⛔ Account ruined at trade #{shownData.findIndex(t=>!t.active)+1} · Balance fell below $430 · IBKR blocks further trades · Simulation stopped
        </div>
      )}

      {/* ══ BAND 5: EV + Streak + Drawdown ═══════════════════════════════ */}
      <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap" }}>

        {/* EV */}
        <div style={{ ...card({flex:1,minWidth:160}), borderLeft:`3px solid ${ev>=0?C.win:C.loss}` }}>
          <div style={lbl}>Expected Value / Trade</div>
          <div style={{ fontSize:18, fontWeight:800, fontFamily:"monospace", color:ev>=0?C.win:C.loss }}>{ev>=0?"+":"−"}${Math.abs(ev).toFixed(2)}</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:3, lineHeight:1.6 }}>
            {stopMode==="2x"?`(80%×$32.20)+(20%×−$72.80)`:`(80%×$32.20)+(20%×−$432.80)`}
          </div>
          <div style={{ fontSize:10, color:ev>=0?C.win:C.loss, fontWeight:600, marginTop:2 }}>
            {`Expected over ${totalTrades} trades: ${ev>=0?"+":"−"}$${Math.abs(ev*totalTrades).toFixed(0)}`}
          </div>
        </div>

        {/* Drawdown */}
        <div style={{ ...card({flex:1,minWidth:160}), borderLeft:`3px solid ${drawdown.maxDD>200?C.loss:drawdown.maxDD>100?C.accent:C.border}` }}>
          <div style={lbl}>Max Drawdown</div>
          <div style={{ fontSize:18, fontWeight:800, fontFamily:"monospace", color:drawdown.maxDD>200?C.loss:drawdown.maxDD>100?C.accent:C.text }}>
            −${drawdown.maxDD.toFixed(2)}
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:3, lineHeight:1.6 }}>
            Peak to trough loss in this sequence.<br/>
            {drawdown.maxDD>0?`Trades #${drawdown.ddStart}→#${drawdown.ddEnd}`:"No drawdown yet"}
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>
            {drawdown.maxDD>200?"⚠ Would you hold through this?":drawdown.maxDD>100?"Uncomfortable but manageable":"Within normal variance"}
          </div>
        </div>

        {/* Streaks */}
        <div style={{ ...card({flex:1,minWidth:140}), borderLeft:`3px solid ${streaks.curLoss>=2?C.loss:C.border}`, background:streaks.curLoss>=3&&animating?(flash?"#2d0a0a":C.panel):C.panel }}>
          <div style={lbl}>Consecutive Losses</div>
          <div style={{ fontSize:18, fontWeight:800, fontFamily:"monospace", color:streaks.curLoss>=2?C.loss:C.muted }}>{streaks.curLoss===0?"—":`⚠ ${streaks.curLoss} in a row`}</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:4, lineHeight:1.7 }}>
            Longest losing streak: <span style={{ color:streaks.maxLoss>=3?C.loss:C.text, fontWeight:700 }}>{streaks.maxLoss}</span><br/>
            Longest winning streak: <span style={{ color:C.win, fontWeight:700 }}>{streaks.maxWin}</span>
          </div>
        </div>

        {/* Win/Loss split */}
        <div style={{ ...card({flex:1,minWidth:140}) }}>
          <div style={lbl}>Win / Loss Split</div>
          <div style={{ height:8, borderRadius:4, overflow:"hidden", background:C.lossDim, margin:"8px 0 6px" }}>
            <div style={{ height:"100%", width:`${(wins/Math.max(activeSeen.length,1))*100}%`, background:C.win, borderRadius:4, transition:"width 0.3s" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600 }}>
            <span style={{ color:C.win }}>W: {wins} ({((wins/Math.max(activeSeen.length,1))*100).toFixed(1)}%)</span>
            <span style={{ color:C.loss }}>L: {losses} ({((losses/Math.max(activeSeen.length,1))*100).toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* ══ BAND 6: Verdict ══════════════════════════════════════════════ */}
      {shownCount===totalTrades && !isRuined && (
        <div style={{ background:isUp?C.winDim:C.lossDim, border:`1px solid ${isUp?C.win:C.loss}`, borderRadius:8, padding:"7px 14px", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
          <span style={{ fontSize:16, fontWeight:800, color:isUp?C.win:C.loss }}>{isUp?"▲ ACCOUNT GREW":"▼ ACCOUNT SHRANK"}</span>
          <span style={{ fontSize:12, color:C.text }}>{wins} wins · {losses} losses · $1,000 → <strong>${balance.toFixed(0)}</strong> · net {fmt(balance-STARTING_BALANCE)} · max drawdown −${drawdown.maxDD.toFixed(0)}</span>
        </div>
      )}

      {/* ══ BAND 7: Equity curve + Trade log ════════════════════════════ */}
      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
        <div style={{ ...card({flex:2,minWidth:0}) }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div style={lbl}>Account Equity Curve{showMC?" · faint lines = 20 other possible outcomes":""}</div>
          </div>
          <EquityCurve trades={shownData} mcLines={showMC?mcLines:[]} totalTrades={totalTrades}/>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.muted, marginTop:3 }}>
            <span>Trade 0 · $1,000</span>
            <span style={{ color:C.loss }}>▼ $430 ruin line</span>
            <span>Trade {shownCount} · ${balance.toFixed(0)}</span>
          </div>
        </div>
        <div style={{ ...card({flex:1,minWidth:140}) }}>
          <div style={lbl}>Last 10 Trades</div>
          <div style={{ overflowY:"auto", maxHeight:160 }}>
            {logTrades.length===0&&<div style={{ fontSize:11, color:C.muted, marginTop:6 }}>Hit Animate to begin</div>}
            {logTrades.map(t=>(
              <div key={t.trade} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"3px 0", borderBottom:`1px solid ${C.border}`, fontSize:11 }}>
                <span style={{ color:C.muted, minWidth:28 }}>#{t.trade}</span>
                <span style={{ color:!t.active?C.muted:t.isWin?C.win:C.loss, fontWeight:700, minWidth:52 }}>{!t.active?"STOPPED":t.isWin?"WIN":"LOSS"}</span>
                <span style={{ color:!t.active?C.muted:t.isWin?C.win:C.loss, fontFamily:"monospace", minWidth:52, textAlign:"right" }}>{!t.active?"—":fmt(t.pnl)}</span>
                <span style={{ color:C.muted, fontFamily:"monospace", textAlign:"right" }}>${t.balance.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ BAND 8: Trade bars ════════════════════════════════════════════ */}
      <div style={{ ...card(), marginBottom:8 }}>
        <div style={{ ...lbl, marginBottom:6 }}>
          Individual Trades &nbsp;·&nbsp; <span style={{ color:C.win }}>▌</span> Win +$32.20 &nbsp;·&nbsp; <span style={{ color:C.loss }}>▌</span> Loss −${lossAmt.toFixed(2)} &nbsp;·&nbsp; <span style={{ color:C.border }}>▌</span> Stopped
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", height:36, gap:"0.5px" }}>
          {shownData.map((t,i)=>{
            if (!t.active) return <div key={i} style={{ width:`${100/totalTrades}%`, height:"2px", backgroundColor:C.border, alignSelf:"flex-end" }}/>;
            const h=Math.max(2,(Math.abs(t.pnl)/LOSS_EXPIRY)*36);
            return <div key={i} title={`#${t.trade}: ${fmt(t.pnl)}`} style={{ width:`${100/totalTrades}%`, height:`${h}px`, backgroundColor:t.isWin?C.win:C.loss, opacity:0.85, borderRadius:"1px", alignSelf:"flex-end" }}/>;
          })}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.muted, marginTop:3 }}>
          <span>Trade 1</span><span>Trade {totalTrades}</span>
        </div>
      </div>

      {/* ══ BAND 9: P&L breakdown ════════════════════════════════════════ */}
      <div style={{ ...card(), marginBottom:8 }}>
        <div style={lbl}>P&amp;L Breakdown</div>
        <div style={{ fontSize:12, lineHeight:2, marginTop:4, display:"flex", gap:20, flexWrap:"wrap" }}>
          <div style={{ display:"flex", gap:12 }}><span style={{ color:C.muted }}>{wins} wins × $32.20 =</span><span style={{ color:C.win, fontWeight:700 }}>+${totalWon.toFixed(2)}</span></div>
          <div style={{ display:"flex", gap:12 }}><span style={{ color:C.muted }}>{losses} losses × ${lossAmt.toFixed(2)} =</span><span style={{ color:C.loss, fontWeight:700 }}>−${totalLost.toFixed(2)}</span></div>
          <div style={{ display:"flex", gap:12, fontWeight:800, fontSize:14, borderLeft:`2px solid ${C.border}`, paddingLeft:12 }}><span style={{ color:C.muted }}>Net:</span><span style={{ color:isUp?C.win:C.loss }}>{fmt(balance-STARTING_BALANCE)}</span></div>
          <div style={{ display:"flex", gap:12, borderLeft:`2px solid ${C.border}`, paddingLeft:12 }}><span style={{ color:C.muted }}>Max drawdown:</span><span style={{ color:drawdown.maxDD>200?C.loss:C.accent, fontWeight:700 }}>−${drawdown.maxDD.toFixed(2)}</span></div>
        </div>
      </div>

      {/* ══ BAND 10: 1,000-run distribution ══════════════════════════════ */}
      <div style={{ ...card() }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <div>
            <div style={lbl}>1,000-Run Distribution · {VIEW_OPTIONS[tradeView].label}</div>
            <div style={{ fontSize:10, color:C.muted }}><span style={{ color:C.win }}>■</span> Ended up &nbsp;·&nbsp; <span style={{ color:C.loss }}>■</span> Ended down &nbsp;·&nbsp; <span style={{ color:C.accent }}>|</span> $1,000 start</div>
          </div>
          <button onClick={()=>setShowDist(v=>!v)} style={{ background:showDist?C.accent:C.bg, color:showDist?"#000":C.accent, border:`1px solid ${C.accent}`, borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>{showDist?"▲ Hide":"▼ Show"}</button>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:showDist?10:0 }}>
          {[
            ["Ended Up",      `${dist.up}/1,000`,              C.win],
            ["Ended Down",    `${dist.down}/1,000`,            C.loss],
            ["Ruined",        `${dist.ruined}/1,000`,          dist.ruined>50?C.loss:C.muted],
            ["Best",          fmt(dist.best-STARTING_BALANCE), C.win],
            ["Worst",         fmt(dist.worst-STARTING_BALANCE),C.loss],
            ["Median",        fmt(dist.median-STARTING_BALANCE),dist.median>=STARTING_BALANCE?C.win:C.loss],
            ["Average",       fmt(dist.avg-STARTING_BALANCE),  dist.avg>=STARTING_BALANCE?C.win:C.loss],
          ].map(([l,v,col])=>(
            <div key={l} style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:6, padding:"6px 10px", flex:1, minWidth:80 }}>
              <div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>{l}</div>
              <div style={{ fontSize:14, fontWeight:800, fontFamily:"monospace", color:col }}>{v}</div>
            </div>
          ))}
        </div>
        {showDist&&(
          <>
            <DistributionChart finals={dist.finals}/>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:C.muted, marginTop:4 }}>
              <span style={{ color:C.loss }}>◀ Losses (left of gold line)</span>
              <span>Each bar = a cluster of people who ended with that balance</span>
              <span style={{ color:C.win }}>Profits ▶ (right of gold line)</span>
            </div>
            <div style={{ marginTop:8, fontSize:11, color:C.muted, lineHeight:1.7 }}>
              {stopMode==="2x"
                ? `With 2× stop over ${totalTrades} trades: ${dist.up}/1,000 sequences profitable. ${dist.ruined} hit ruin. Positive EV (+$${EV_2X.toFixed(2)}/trade) means the edge grows with time — compare 100 vs 300 trades to see this clearly.`
                : `Without a stop over ${totalTrades} trades: ${dist.ruined}/1,000 sequences end in ruin. Negative EV means every trade works against you — and time makes it worse, not better.`
              }
            </div>
          </>
        )}
      </div>

    </div>
  );
}
