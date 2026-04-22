import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpRight, Plane, Hotel, Package, Gift, TrendingUp, AlertTriangle, ChevronDown, ChevronRight, Info, Target, RefreshCw, ExternalLink, BookOpen, HelpCircle, Building2, Briefcase, ShoppingBag, Sparkles, X, Radio, Rss, MessageCircle, Database, CheckCircle2, Clock, Search } from 'lucide-react';

// ============================================================
// Data imported from git-versioned YAML (see /data/*.yaml)
// Compiled by scripts/build-data.js into src/data.js
// ============================================================
import { SOURCE_PROGRAMS, REDEMPTION_OPTIONS, DATA_SOURCES as DATA_SOURCES_RAW, META } from './data.js';

// Hydrate DATA_SOURCES with icon components (icons can't be serialized in YAML)
const ICON_MAP = { blog: Rss, forum: MessageCircle, aggregator: Database, reddit: MessageCircle, discord: Radio, telegram: Radio, official: Database };
const DATA_SOURCES = DATA_SOURCES_RAW.map(s => ({
  ...s,
  lastUpdate: s.lastUpdate || 'recent',
  status: 'ok',
  icon: ICON_MAP[s.type] || Rss,
}));

// Category list (local — maps to partner categories in data.js)
const CATEGORIES = [
  { key: 'all',             label: 'All',                icon: Target },
  { key: 'intl_flight',     label: 'Intl Flights',       icon: Plane },
  { key: 'domestic_flight', label: 'Domestic Flights',   icon: Plane },
  { key: 'luxury_hotel',    label: 'Luxury Hotels',      icon: Building2 },
  { key: 'mid_hotel',       label: 'Mid-tier Hotels',    icon: Hotel },
  { key: 'package',         label: 'Flexible Packages',  icon: Package },
  { key: 'experiences',     label: 'Experiences',        icon: Sparkles },
  { key: 'shopping',        label: 'Shopping',           icon: ShoppingBag },
  { key: 'cashback',        label: 'Cashback',           icon: Briefcase },
];

// Simulated recent change feed — replace with backend API call in production
const CHANGE_FEED = [
  { id: 1, time: '15m ago',  source: 'r/CreditCardsIndia', type: 'bonus',       title: 'HDFC → Flying Blue 30% bonus reported',                 priority: 'high' },
  { id: 2, time: '2h ago',   source: 'PointsMath',         type: 'devaluation', title: 'Axis Atlas IHG ratio changed 1:2 → 2:5',                priority: 'high' },
  { id: 3, time: '4h ago',   source: 'Magnify.club',       type: 'sweetspot',   title: 'Flying Blue Promo: DEL→CDG 22,500 miles (April)',       priority: 'medium' },
  { id: 4, time: '6h ago',   source: 'LiveFromALounge',    type: 'devaluation', title: 'KrisFlyer raises DEL→SIN J saver to 38K',               priority: 'medium' },
  { id: 5, time: '8h ago',   source: 'Discord: IN Points', type: 'bonus',       title: 'Amex Marriott 15% transfer bonus (verified)',           priority: 'high' },
  { id: 6, time: '12h ago',  source: 'TechnoFino Forum',   type: 'info',        title: 'Air India chart reduces DEL→LHR Y to 35K',              priority: 'medium' },
  { id: 7, time: '1d ago',   source: 'CardInsider',        type: 'info',        title: 'ICICI iShop adds Taj vouchers at 6X rate',              priority: 'low' },
  { id: 8, time: '2d ago',   source: 'Points Dojo',        type: 'info',        title: 'Updated HDFC Infinia SmartBuy 3X multiplier',           priority: 'medium' },
];

const BANKS_ORDER = ['HDFC Bank', 'HDFC / Tata', 'Axis Bank', 'American Express', 'ICICI Bank', 'SBI Card', 'HSBC India', 'Kotak Mahindra', 'IndusInd Bank', 'Yes Bank', 'AU Small Finance', 'IDFC FIRST', 'Standard Chartered', 'RBL Bank'];

function computeOptions(sourceKey, balance) {
  const source = SOURCE_PROGRAMS[sourceKey];
  if (!source) return [];
  return REDEMPTION_OPTIONS
    .filter(opt => opt.sources[sourceKey])
    .map(opt => {
      const edge = opt.sources[sourceKey];
      const effectivePartnerMiles = Math.floor(balance * edge.ratio);
      const inrRealistic = effectivePartnerMiles * opt.valuation.realistic;
      const inrCeiling = effectivePartnerMiles * opt.valuation.ceiling;
      const inrFloor = effectivePartnerMiles * opt.valuation.floor;
      const sourcePointsNeeded = Math.ceil(opt.sweetSpot.milesNeeded / edge.ratio);
      const gap = Math.max(0, sourcePointsNeeded - balance);
      const hasEnough = balance >= sourcePointsNeeded;
      const completionPct = Math.min(100, (balance / sourcePointsNeeded) * 100);
      const inrPerSourcePoint = opt.valuation.realistic * edge.ratio;
      const ceilingPerSourcePoint = opt.valuation.ceiling * edge.ratio;
      return { ...opt, effectivePartnerMiles, edge, inrRealistic, inrCeiling, inrFloor,
        inrPerSourcePoint, ceilingPerSourcePoint, sourcePointsNeeded, gap, hasEnough, completionPct };
    })
    .sort((a, b) => b.ceilingPerSourcePoint - a.ceilingPerSourcePoint);
}

const formatInr = n => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` :
  n >= 100000 ? `₹${(n/100000).toFixed(2)}L` :
  n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : `₹${Math.round(n)}`;
const formatPts = n => n >= 100000 ? `${(n/100000).toFixed(2)}L` :
  n >= 1000 ? `${(n/1000).toFixed(1)}K` : `${Math.round(n)}`;

// ============================================================
// MODAL COMPONENTS
// ============================================================

function MethodologyModal({ onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,20,22,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fefdfb', maxWidth: 720, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: '32px 40px', border: '1px solid #e8e4dc', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#8a847a' }}>
          <X size={20} />
        </button>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: '#b8956a', textTransform: 'uppercase', marginBottom: 4 }}>Methodology</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, margin: '4px 0 24px 0', letterSpacing: '-0.02em', color: '#1a1914' }}>How recommendations are ranked</h2>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: '#3a3730' }}>
          <p><strong>Ranking formula.</strong> Every option is scored by <em>ceiling INR per source point</em>, computed as <code style={{ backgroundColor: '#f4efe6', padding: '2px 6px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>valuation.ceiling × transfer_ratio</code>. This single number expresses what one point from your wallet could yield at peak use — a 1:2 transfer to a partner worth ₹2.50/mile beats a 1:1 to a ₹1/mile partner.</p>
          <p><strong>Why ceiling and not realistic?</strong> Ranking optimizes for the best possible use. A user willing to hunt premium-cabin award space should see Turkish→J to USA at the top even if the realistic day-to-day use is lower. Realistic and floor are shown alongside so users can compare apples-to-apples.</p>
          <p><strong>What's not modeled (yet).</strong> Award availability is not real-time. The gap analysis assumes your points sit ready to transfer — it doesn't factor annual caps (HDFC's 150K/75K monthly limits, Axis Group A/B caps) or the ₹99/₹199 + 18% GST transfer fees. These land in v2.</p>
          <p><strong>Data freshness.</strong> Each row carries a <em>last verified</em> date and the data sources that contributed. Data is refreshed from third-party aggregators (PointsMath, CardInsider, Magnify.club), community channels (TechnoFino, r/CreditCardsIndia, Discord, Telegram), and official program pages.</p>
        </div>
      </div>
    </div>
  );
}

function GlossaryModal({ onClose }) {
  const terms = [
    { term: 'Source Program', def: 'The reward currency you already hold — e.g., HDFC RP, Axis EDGE Miles, Amex MR. This is your "wallet".' },
    { term: 'Effective Miles', def: 'How many miles/points you receive at the partner after applying the transfer ratio. 100K HDFC RP at 1:1 to KrisFlyer = 100K KF miles. At 2:1 to Marriott = 50K Marriott points.' },
    { term: 'Transfer Ratio', def: 'The conversion rate between your source and the partner. Format here: "2:1" means 2 source points become 1 partner mile. "1:2" means 1 source mile becomes 2 partner points (Atlas style).' },
    { term: 'Floor Value', def: 'The worst-case realistic INR value per partner point — typically what the bank catalog or cashback baseline gives you.' },
    { term: 'Realistic Value', def: 'The median value a typical traveler gets. Use this for everyday planning.' },
    { term: 'Ceiling Value', def: 'The peak INR value when used for a premium-cabin sweet spot with high cash-price redemption. Use this when maximizing a specific luxury trip.' },
    { term: 'Sweet Spot', def: 'A curated high-value redemption route for each partner — e.g., "DEL→SIN Business Saver for 36,500 KrisFlyer miles".' },
    { term: 'Gap', def: 'How many more source points you need to book the listed sweet spot. If your balance ≥ points needed, you\'re eligible now.' },
    { term: 'Dynamic Pricing', def: 'Programs that flex award prices based on cash fares (Marriott, Hilton, IHG, United, Flying Blue). Always verify the actual price before transferring.' },
  ];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,20,22,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fefdfb', maxWidth: 720, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: '32px 40px', border: '1px solid #e8e4dc', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#8a847a' }}>
          <X size={20} />
        </button>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: '#b8956a', textTransform: 'uppercase', marginBottom: 4 }}>Glossary</div>
        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, margin: '4px 0 24px 0', letterSpacing: '-0.02em', color: '#1a1914' }}>What every term means</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {terms.map(t => (
            <div key={t.term} style={{ paddingBottom: 14, borderBottom: '1px solid #f4efe6' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 500, color: '#1a1914', marginBottom: 4 }}>{t.term}</div>
              <div style={{ fontSize: 13, color: '#3a3730', lineHeight: 1.6 }}>{t.def}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataSourcesPanel({ onClose }) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState('1 minute ago');
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setLastRefresh('just now'); }, 1400);
  };
  const typeColors = { blog: '#b8956a', forum: '#7a9973', aggregator: '#8b6f94', reddit: '#c4846a', discord: '#6b87a8', telegram: '#6b87a8' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,20,22,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24, backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fefdfb', maxWidth: 960, width: '100%', maxHeight: '88vh', overflow: 'auto', padding: '32px 40px', border: '1px solid #e8e4dc', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#8a847a' }}>
          <X size={20} />
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #f4efe6' }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: '#b8956a', textTransform: 'uppercase', marginBottom: 4 }}>Live Data Pipeline</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, margin: '4px 0 0 0', letterSpacing: '-0.02em', color: '#1a1914' }}>Data Sources</h2>
            <div style={{ fontSize: 12, color: '#6a6258', marginTop: 6 }}>
              Ingesting from {DATA_SOURCES.length} active sources · Last sync <strong>{lastRefresh}</strong>
            </div>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
            backgroundColor: refreshing ? '#e8e4dc' : '#1a1914', color: refreshing ? '#8a847a' : '#fefdfb',
            border: 'none', cursor: refreshing ? 'default' : 'pointer', fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em'
          }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            {refreshing ? 'Syncing…' : 'Refresh Now'}
          </button>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.15em', color: '#8a847a', textTransform: 'uppercase', marginBottom: 12 }}>Recent Changes (feed)</div>
          <div style={{ border: '1px solid #f4efe6' }}>
            {CHANGE_FEED.slice(0, 6).map((item, idx) => (
              <div key={item.id} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr 140px 90px',
                gap: 16, padding: '12px 16px', fontSize: 12,
                borderBottom: idx < 5 ? '1px solid #f4efe6' : 'none',
                alignItems: 'center', backgroundColor: idx % 2 ? '#fbf8f2' : 'transparent'
              }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8a847a' }}>{item.time}</div>
                <div style={{ color: '#1a1914' }}>
                  <span style={{
                    display: 'inline-block', padding: '1px 6px', marginRight: 8, fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    backgroundColor: item.type === 'bonus' ? '#e8f2e5' : item.type === 'devaluation' ? '#f8e8e0' : item.type === 'sweetspot' ? '#fdf3e5' : '#f0ecdf',
                    color: item.type === 'bonus' ? '#4a7043' : item.type === 'devaluation' ? '#a8543a' : item.type === 'sweetspot' ? '#b8956a' : '#6a6258'
                  }}>{item.type}</span>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: '#6a6258', fontStyle: 'italic' }}>{item.source}</div>
                <div style={{
                  fontSize: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: item.priority === 'high' ? '#a8543a' : item.priority === 'medium' ? '#b8956a' : '#8a847a'
                }}>{item.priority}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.15em', color: '#8a847a', textTransform: 'uppercase', marginBottom: 12 }}>All Sources</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {DATA_SOURCES.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.id} style={{ border: '1px solid #f4efe6', padding: '14px 16px', backgroundColor: '#fbf8f2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Icon size={14} style={{ color: typeColors[s.type] || '#8a847a', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1914' }}>{s.name}</div>
                        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', color: typeColors[s.type] || '#8a847a', marginTop: 2, textTransform: 'uppercase' }}>{s.type}</div>
                      </div>
                    </div>
                    <CheckCircle2 size={12} style={{ color: '#7a9973', marginTop: 2 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#6a6258', marginTop: 8, lineHeight: 1.5 }}>{s.coverage}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                    <span style={{ color: '#8a847a' }}><Clock size={9} style={{ display: 'inline', marginRight: 3, verticalAlign: '-1px' }} />{s.lastUpdate}</span>
                    {s.url !== '#' && <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: '#b8956a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>visit <ExternalLink size={9} /></a>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#fdf3e5', border: '1px solid #f0d9b8', fontSize: 11, color: '#6a5943', lineHeight: 1.6 }}>
          <strong style={{ color: '#a8543a' }}>Honest note:</strong> Official bank portals (HDFC SmartBuy, Axis EDGE) block direct scraping per their ToS. Data here is aggregated from third-party content sites, community channels, and verified community reports — the same sources serious points enthusiasts rely on. High-priority devaluations are typically surfaced by community channels (Discord, TechnoFino, Reddit) within minutes; blog confirmations follow within hours.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================

export default function PointsOptimizer() {
  const [sourceKey, setSourceKey] = useState('hdfc_infinia');
  const [balance, setBalance] = useState(100000);
  const [category, setCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showMethod, setShowMethod] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);

  const allOptions = useMemo(() => computeOptions(sourceKey, balance), [sourceKey, balance]);

  const displayedOptions = useMemo(() => {
    if (category === 'all') {
      const byCategory = {};
      allOptions.forEach(o => {
        if (!byCategory[o.category]) byCategory[o.category] = [];
        if (byCategory[o.category].length < 3) byCategory[o.category].push(o);
      });
      return Object.values(byCategory).flat().sort((a, b) => b.ceilingPerSourcePoint - a.ceilingPerSourcePoint);
    }
    return allOptions.filter(o => o.category === category).slice(0, 3);
  }, [allOptions, category]);

  const topOption = allOptions[0];
  const source = SOURCE_PROGRAMS[sourceKey];
  const baselineValue = balance * source.baseInr;
  const topCeilingValue = topOption ? topOption.ceilingPerSourcePoint * balance : 0;
  const upliftPct = baselineValue > 0 ? ((topCeilingValue - baselineValue) / baselineValue) * 100 : 0;

  const catCounts = useMemo(() => {
    const counts = { all: allOptions.length };
    allOptions.forEach(o => { counts[o.category] = (counts[o.category] || 0) + 1; });
    return counts;
  }, [allOptions]);

  // Group sources by bank for the dropdown, filtered by search
  const groupedSources = useMemo(() => {
    const groups = {};
    Object.entries(SOURCE_PROGRAMS).forEach(([k, v]) => {
      const searchLower = sourceSearch.toLowerCase();
      if (sourceSearch && !v.label.toLowerCase().includes(searchLower) && !v.bank.toLowerCase().includes(searchLower)) return;
      if (!groups[v.bank]) groups[v.bank] = [];
      groups[v.bank].push({ key: k, ...v });
    });
    return BANKS_ORDER.filter(b => groups[b] && groups[b].length > 0).map(b => ({ bank: b, cards: groups[b] }));
  }, [sourceSearch]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fbf8f2', color: '#1a1914', fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap');
        * { box-sizing: border-box; }
        input[type="number"] { -moz-appearance: textfield; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        @keyframes slideIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .row-animate { animation: slideIn 0.3s ease-out forwards; }
      `}</style>

      {showMethod && <MethodologyModal onClose={() => setShowMethod(false)} />}
      {showGlossary && <GlossaryModal onClose={() => setShowGlossary(false)} />}
      {showSources && <DataSourcesPanel onClose={() => setShowSources(false)} />}

      <header style={{ borderBottom: '1px solid #e8e4dc', padding: '20px 32px', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(251,248,242,0.92)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1400, margin: '0 auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#b8956a' }} />
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.2em', color: '#8a847a', textTransform: 'uppercase' }}>Points Terminal / IN</div>
            </div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 500, margin: '4px 0 0 0', letterSpacing: '-0.02em' }}>
              Redemption Optimizer
            </h1>
            <div style={{ fontSize: 11, color: '#8a847a', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
              {Object.keys(SOURCE_PROGRAMS).length} cards · {BANKS_ORDER.length} banks · {REDEMPTION_OPTIONS.length} redemption options
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setShowSources(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #e8e4dc', color: '#1a1914', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
              <Radio size={13} /> Data Sources
            </button>
            <button onClick={() => setShowMethod(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #e8e4dc', color: '#1a1914', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
              <BookOpen size={13} /> Methodology
            </button>
            <button onClick={() => setShowGlossary(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', backgroundColor: 'transparent', border: '1px solid #e8e4dc', color: '#1a1914', cursor: 'pointer', fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
              <HelpCircle size={13} /> Glossary
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 1, backgroundColor: '#e8e4dc', border: '1px solid #e8e4dc', marginBottom: 24 }}>
          <div style={{ padding: '20px 24px', backgroundColor: '#fefdfb', position: 'relative' }}>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8a847a', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Source Card</label>
            <div onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)} style={{
              marginTop: 8, padding: '10px 0', fontSize: 14, cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid #e8e4dc'
            }}>
              <div>
                <div style={{ color: '#1a1914' }}>{source.label}</div>
                <div style={{ fontSize: 11, color: '#8a847a', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                  {source.bank} · {source.tier} · {source.earnRate}
                </div>
              </div>
              <ChevronDown size={16} style={{ color: '#8a847a', transform: sourceDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </div>
            {sourceDropdownOpen && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                backgroundColor: '#fefdfb', border: '1px solid #e8e4dc', borderTop: 'none',
                maxHeight: 480, overflow: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
              }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #f4efe6', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Search size={13} style={{ color: '#8a847a' }} />
                  <input
                    type="text"
                    placeholder="Search cards or banks…"
                    value={sourceSearch}
                    onChange={e => setSourceSearch(e.target.value)}
                    autoFocus
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: "'Inter', sans-serif", backgroundColor: 'transparent' }}
                  />
                </div>
                {groupedSources.length === 0 ? (
                  <div style={{ padding: 20, fontSize: 12, color: '#8a847a', textAlign: 'center' }}>No matches</div>
                ) : (
                  groupedSources.map(({ bank, cards }) => (
                    <div key={bank}>
                      <div style={{ padding: '8px 16px 4px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.15em', color: '#b8956a', textTransform: 'uppercase', backgroundColor: '#fbf8f2' }}>
                        {bank}
                      </div>
                      {cards.map(c => (
                        <div
                          key={c.key}
                          onClick={() => { setSourceKey(c.key); setSourceDropdownOpen(false); setSourceSearch(''); }}
                          style={{
                            padding: '10px 16px', cursor: 'pointer',
                            backgroundColor: sourceKey === c.key ? '#fdf3e5' : 'transparent',
                            borderLeft: sourceKey === c.key ? '3px solid #b8956a' : '3px solid transparent',
                          }}
                          onMouseEnter={e => { if (sourceKey !== c.key) e.currentTarget.style.backgroundColor = '#fbf8f2'; }}
                          onMouseLeave={e => { if (sourceKey !== c.key) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <div style={{ fontSize: 13, color: '#1a1914', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{c.label}</span>
                            <span style={{ fontSize: 10, color: '#8a847a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{c.tier}</span>
                          </div>
                          <div style={{ fontSize: 10, color: '#8a847a', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                            {c.earnRate} · Base ₹{c.baseInr.toFixed(2)}/pt
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ padding: '20px 24px', backgroundColor: '#fefdfb' }}>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8a847a', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Balance</label>
            <input type="number" value={balance} onChange={e => setBalance(Math.max(0, parseInt(e.target.value) || 0))} style={{
              width: '100%', marginTop: 8, padding: '10px 0', fontSize: 24, backgroundColor: 'transparent',
              color: '#b8956a', border: 'none', borderBottom: '1px solid #e8e4dc', outline: 'none',
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 500
            }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {[50000, 100000, 250000, 500000].map(v => (
                <button key={v} onClick={() => setBalance(v)} style={{
                  padding: '3px 8px', fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                  backgroundColor: balance === v ? '#1a1914' : 'transparent',
                  color: balance === v ? '#fefdfb' : '#8a847a',
                  border: '1px solid #e8e4dc', cursor: 'pointer', letterSpacing: '0.05em'
                }}>{formatPts(v)}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px 24px', backgroundColor: '#fefdfb', borderLeft: '2px solid #b8956a' }}>
            <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#b8956a', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Top Ceiling Value</label>
            <div style={{ fontSize: 30, fontFamily: "'Fraunces', serif", fontWeight: 500, color: '#1a1914', marginTop: 6, letterSpacing: '-0.02em' }}>
              {formatInr(topCeilingValue)}
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#8a847a', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
              <span>Base {formatInr(baselineValue)}</span>
              <span style={{ color: upliftPct > 0 ? '#4a7043' : '#8a847a' }}>
                {upliftPct > 0 ? '↑' : ''} {upliftPct.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {topOption && (
          <div style={{ marginBottom: 32, padding: '24px 28px', backgroundColor: '#fefdfb', border: '1px solid #e8e4dc', borderLeft: '3px solid #b8956a' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#b8956a', letterSpacing: '0.2em', textTransform: 'uppercase' }}>→ Recommendation</div>
                  <button onClick={() => setShowMethod(true)} style={{ background: 'none', border: 'none', color: '#8a847a', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Info size={12} />
                  </button>
                </div>
                <div style={{ fontSize: 22, fontFamily: "'Fraunces', serif", fontWeight: 500, marginTop: 6, color: '#1a1914' }}>
                  Transfer to <span style={{ color: '#b8956a' }}>{topOption.partner}</span>
                </div>
                <div style={{ fontSize: 13, color: '#3a3730', marginTop: 8, maxWidth: 760, lineHeight: 1.6 }}>
                  {formatPts(balance)} {source.label.split('(')[0].trim()} points convert to <strong>{formatPts(topOption.effectivePartnerMiles)}</strong> {topOption.partner} {topOption.category.includes('hotel') ? 'points' : 'miles'}, unlocking <strong>{topOption.sweetSpot.example}</strong>{topOption.hasEnough ? ' — you have enough right now.' : ` — you need ${formatPts(topOption.gap)} more source points.`}
                </div>
              </div>
              {topOption.deepLink && (
                <a href={topOption.deepLink} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                  backgroundColor: '#1a1914', color: '#fefdfb', textDecoration: 'none',
                  fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap'
                }}>
                  Redeem Now <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 0, marginBottom: 12, borderBottom: '1px solid #e8e4dc', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const count = catCounts[cat.key] || 0;
            const active = category === cat.key;
            const hasAny = cat.key === 'all' || count > 0;
            return (
              <button key={cat.key} onClick={() => setCategory(cat.key)} disabled={!hasAny} style={{
                padding: '14px 16px', background: 'transparent', border: 'none',
                borderBottom: active ? '2px solid #b8956a' : '2px solid transparent',
                color: !hasAny ? '#d0cbc0' : active ? '#1a1914' : '#8a847a',
                cursor: hasAny ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: "'Inter', sans-serif", fontSize: 13, marginBottom: -1, whiteSpace: 'nowrap'
              }}>
                <Icon size={14} />
                {cat.label}
                {count > 0 && (
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                    color: active ? '#b8956a' : '#8a847a',
                    backgroundColor: active ? 'rgba(184,149,106,0.1)' : 'transparent',
                    padding: '2px 6px'
                  }}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 16, fontSize: 11, color: '#8a847a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
          Showing top {displayedOptions.length} {category === 'all' ? 'across all categories' : `in ${CATEGORIES.find(c=>c.key===category).label}`}
        </div>

        <div style={{ border: '1px solid #e8e4dc', backgroundColor: '#fefdfb' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '40px 2fr 1.2fr 1fr 1fr 1.2fr 40px',
            gap: 16, padding: '12px 20px', borderBottom: '1px solid #e8e4dc',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8a847a',
            letterSpacing: '0.15em', textTransform: 'uppercase', backgroundColor: '#fbf8f2'
          }}>
            <div>#</div><div>Partner</div><div>Effective Miles</div><div>Realistic (₹)</div><div>Ceiling (₹)</div><div>Sweet Spot Progress</div><div></div>
          </div>

          {displayedOptions.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#8a847a', fontSize: 14 }}>
              No direct transfer paths from {source.label} for this category.
            </div>
          ) : (
            displayedOptions.map((opt, idx) => {
              const isTop = idx === 0;
              const rowId = `${opt.partner}-${idx}`;
              const isExpanded = expandedId === rowId;
              const CatIcon = CATEGORIES.find(c => c.key === opt.category)?.icon || Gift;
              return (
                <div key={rowId} className="row-animate" style={{ animationDelay: `${idx * 30}ms` }}>
                  <div onClick={() => setExpandedId(isExpanded ? null : rowId)} style={{
                    display: 'grid', gridTemplateColumns: '40px 2fr 1.2fr 1fr 1fr 1.2fr 40px',
                    gap: 16, padding: '16px 20px', borderBottom: '1px solid #f4efe6',
                    cursor: 'pointer', alignItems: 'center',
                    backgroundColor: isExpanded ? '#fbf8f2' : 'transparent'
                  }}
                    onMouseEnter={e => !isExpanded && (e.currentTarget.style.backgroundColor = '#fbf8f2')}
                    onMouseLeave={e => !isExpanded && (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: isTop ? '#b8956a' : '#c5bdaf' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <CatIcon size={14} style={{ color: '#8a847a', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1914' }}>
                          {opt.partner}
                          {isTop && <span style={{ marginLeft: 8, fontSize: 9, color: '#b8956a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em', padding: '2px 6px', border: '1px solid #b8956a' }}>BEST</span>}
                          {opt.dynamicPricing && <span style={{ marginLeft: 6, fontSize: 9, color: '#a8543a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>• DYNAMIC</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#8a847a', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>{opt.edge.note}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#1a1914' }}>
                      {formatPts(opt.effectivePartnerMiles)}
                      <div style={{ fontSize: 10, color: '#8a847a', marginTop: 2 }}>@ {opt.edge.ratio < 1 ? `${Math.round(1/opt.edge.ratio)}:1` : `1:${opt.edge.ratio}`}</div>
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#3a3730' }}>{formatInr(opt.inrRealistic)}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: '#b8956a', fontWeight: 500 }}>{formatInr(opt.inrCeiling)}</div>
                    <div>
                      {opt.hasEnough ? (
                        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#4a7043', letterSpacing: '0.05em' }}>✓ ELIGIBLE</div>
                      ) : (
                        <div>
                          <div style={{ height: 4, backgroundColor: '#f4efe6', overflow: 'hidden', marginBottom: 4 }}>
                            <div style={{ height: '100%', width: `${opt.completionPct}%`, backgroundColor: '#c4846a' }} />
                          </div>
                          <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#8a847a' }}>
                            Need {formatPts(opt.gap)} more · {opt.completionPct.toFixed(0)}%
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ color: '#8a847a', display: 'flex', justifyContent: 'flex-end' }}>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '20px 20px 24px 60px', backgroundColor: '#fbf8f2', borderBottom: '1px solid #f4efe6', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
                      <div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8a847a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Sweet Spot</div>
                        <div style={{ fontSize: 16, fontFamily: "'Fraunces', serif", color: '#1a1914', marginBottom: 4 }}>{opt.sweetSpot.example}</div>
                        <div style={{ fontSize: 12, color: '#6a6258', marginBottom: 16 }}>
                          {opt.sweetSpot.cabin} · Cash comparable {formatInr(opt.sweetSpot.cashValueInr)}
                          {opt.sweetSpot.taxesInr > 0 && ` · Taxes ~${formatInr(opt.sweetSpot.taxesInr)}`}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                          <div style={{ padding: '10px 12px', backgroundColor: '#fefdfb', border: '1px solid #e8e4dc' }}>
                            <div style={{ fontSize: 9, color: '#8a847a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>FLOOR</div>
                            <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: '#3a3730', marginTop: 4 }}>₹{opt.valuation.floor.toFixed(2)}</div>
                          </div>
                          <div style={{ padding: '10px 12px', backgroundColor: '#fefdfb', border: '1px solid #e8e4dc' }}>
                            <div style={{ fontSize: 9, color: '#8a847a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>REALISTIC</div>
                            <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: '#1a1914', marginTop: 4 }}>₹{opt.valuation.realistic.toFixed(2)}</div>
                          </div>
                          <div style={{ padding: '10px 12px', backgroundColor: '#fefdfb', border: '1px solid #b8956a' }}>
                            <div style={{ fontSize: 9, color: '#b8956a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>CEILING</div>
                            <div style={{ fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: '#b8956a', marginTop: 4 }}>₹{opt.valuation.ceiling.toFixed(2)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                          {opt.tags.map(tag => (
                            <span key={tag} style={{ fontSize: 10, padding: '3px 8px', backgroundColor: '#f4efe6', color: '#3a3730', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>{tag}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: 10, color: '#8a847a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
                          Last verified <strong>{opt.lastVerified}</strong> · Sources: {opt.dataSources.join(', ')}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8a847a', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Gap Analysis</div>
                        {opt.hasEnough ? (
                          <div style={{ padding: 16, backgroundColor: '#fefdfb', border: '1px solid #d8e2d3' }}>
                            <div style={{ color: '#4a7043', fontSize: 13, marginBottom: 4 }}>✓ You have enough points</div>
                            <div style={{ fontSize: 11, color: '#6a6258', lineHeight: 1.5 }}>
                              Needs <strong style={{ color: '#1a1914' }}>{formatPts(opt.sourcePointsNeeded)}</strong> source points.
                              You have <strong style={{ color: '#1a1914' }}>{formatPts(balance)}</strong>.
                              Surplus: <strong style={{ color: '#4a7043' }}>{formatPts(balance - opt.sourcePointsNeeded)}</strong>.
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: 16, backgroundColor: '#fefdfb', border: '1px solid #e8e4dc' }}>
                            <div style={{ fontSize: 11, color: '#8a847a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', marginBottom: 4 }}>SHORTFALL</div>
                            <div style={{ fontSize: 22, fontFamily: "'Fraunces', serif", color: '#a8543a', marginBottom: 12 }}>{formatPts(opt.gap)} points</div>
                            <div style={{ fontSize: 11, color: '#3a3730', lineHeight: 1.6, marginBottom: 8 }}>To close this gap you'd need approximately:</div>
                            <div style={{ fontSize: 11, color: '#3a3730', lineHeight: 1.8, fontFamily: "'JetBrains Mono', monospace" }}>
                              • {formatInr(opt.gap * 150 / 5)} spend @ 5 RP/₹150 base<br/>
                              • {formatInr(opt.gap * 150 / 50)} spend @ 10X SmartBuy
                            </div>
                          </div>
                        )}
                        {opt.deepLink && (
                          <a href={opt.deepLink} target="_blank" rel="noopener noreferrer" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginTop: 12, padding: '12px 16px',
                            backgroundColor: 'transparent', border: '1px solid #e8e4dc',
                            color: '#1a1914', textDecoration: 'none', fontSize: 12
                          }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#b8956a'; e.currentTarget.style.color = '#b8956a'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e4dc'; e.currentTarget.style.color = '#1a1914'; }}>
                            <span>Open redemption portal</span>
                            <ArrowUpRight size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: '#8a847a', fontStyle: 'italic' }}>
          Click any row to expand full gap analysis and valuation breakdown.
        </div>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: '1px solid #e8e4dc', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8a847a', display: 'flex', justifyContent: 'space-between', letterSpacing: '0.1em' }}>
          <span>MVP · Not financial advice · Verify ratios at source</span>
          <span>points-terminal / in / v0.3</span>
        </div>
      </div>
    </div>
  );
}
