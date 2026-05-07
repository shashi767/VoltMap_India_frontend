import { useEffect, useState } from "react"
import axios from "axios"
import KPICard from "../components/KPICard"
import LoadingSkeleton from "../components/LoadingSkeleton"
import useStickyState from "../hooks/useStickyState"

const API = "http://localhost:8000"

function getColor(gap) {
  if (gap > 30) return "var(--color-urgent)"
  if (gap > 15) return "var(--color-high)"
  return "var(--color-good)"
}

function getLabel(gap) {
  if (gap > 30) return "CRITICAL"
  if (gap > 15) return "ELEVATED"
  return "BALANCED"
}

function getBadgeBg(gap) {
  if (gap > 30) return "rgba(236,72,153,0.12)"
  if (gap > 15) return "rgba(249,115,22,0.12)"
  return "rgba(132,204,22,0.12)"
}

export default function GapMap({ theme }) {
  const isDark = theme === "dark"
  const [data,    setData]    = useState([])
  const [sortBy,  setSortBy]  = useStickyState("gap_score", "gap-sort")
  const [filter,  setFilter]  = useStickyState("all", "gap-filter")
  const [loading, setLoading] = useState(true)
  const [legendOpen, setLegendOpen] = useState(false)

  useEffect(() => {
    axios.get(`${API}/api/gap-analysis`)
      .then(r => { setData(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = data.filter(d => {
    if (filter === "urgent")   return d.gap_score > 30
    if (filter === "high")     return d.gap_score > 15 && d.gap_score <= 30
    if (filter === "moderate") return d.gap_score <= 15
    return true
  })

  const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy])

  const critical = data.filter(d => d.gap_score > 30).length
  const elevated = data.filter(d => d.gap_score > 15 && d.gap_score <= 30).length
  const balanced = data.filter(d => d.gap_score <= 15).length

  return (
    <div className="fade-up" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
          Geospatial Gap Analysis
        </h1>
        <p className="text-base font-medium" style={{ color: "var(--text-muted)" }}>
          State-level EV infrastructure deficit · Demand vs Supply scoring · K-Means classified
        </p>
      </div>

      {/* ── Legend / Guide Panel ─────────────────────────────── */}
      <div className="data-card mb-6" style={{ padding: 0, overflow: "hidden" }}>

        {/* Toggle header */}
        <button
          onClick={() => setLegendOpen(o => !o)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            borderBottom: legendOpen ? "1px solid var(--border-color)" : "none",
            transition: "border 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--text-primary)" }}>
              How to read this page
            </span>
            <span style={{
              fontSize: "0.72rem", fontWeight: 700,
              color: "var(--color-model1)",
              background: "rgba(250,204,21,0.12)",
              border: "1px solid rgba(250,204,21,0.3)",
              padding: "2px 8px", borderRadius: 20,
              letterSpacing: "0.06em",
            }}>GUIDE</span>
          </div>
          <span style={{
            fontSize: 18,
            color: "var(--text-muted)",
            transform: legendOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
            display: "inline-block",
          }}>▾</span>
        </button>

        {/* Collapsible body */}
        {legendOpen && (
          <div style={{ padding: "20px 20px 24px", animation: "fadeUp 0.25s ease-out" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>

              {/* ── Severity Badges ── */}
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em",
                  color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                  Status Badges
                </div>
                {[
                  { label: "CRITICAL",  color: "var(--color-urgent)", bg: "rgba(236,72,153,0.12)",  desc: "Gap score > 30. Severe EV infrastructure deficit; supply is far below demand." },
                  { label: "ELEVATED",  color: "var(--color-high)",   bg: "rgba(249,115,22,0.12)",  desc: "Gap score 15–30. Moderate deficit; infrastructure is lagging but improving." },
                  { label: "BALANCED",  color: "var(--color-good)",   bg: "rgba(34,197,94,0.12)",   desc: "Gap score ≤ 15. Supply is reasonably meeting demand for EV infrastructure." },
                ].map(b => (
                  <div key={b.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                    <span style={{
                      fontSize: "0.68rem", fontWeight: 800,
                      color: b.color, background: b.bg,
                      border: `1px solid ${b.color}40`,
                      padding: "2px 8px", borderRadius: 6,
                      letterSpacing: "0.06em", whiteSpace: "nowrap", marginTop: 1,
                    }}>{b.label}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.55 }}>{b.desc}</span>
                  </div>
                ))}
              </div>

              {/* ── Score Metrics ── */}
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em",
                  color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                  Score Metrics (per card)
                </div>
                {[
                  { name: "Gap Score",     color: "var(--color-urgent)", desc: "The overall infrastructure deficit = Demand Score minus Supply Score. Higher = worse coverage." },
                  { name: "Demand Score",  color: "var(--text-primary)", desc: "A composite of the state's EV registration growth, population, and urban density. Higher = more demand." },
                  { name: "Supply Score",  color: "var(--text-secondary)", desc: "Reflects the existing charging infrastructure capacity relative to EV fleet size. Higher = better supply." },
                ].map(m => (
                  <div key={m.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: "0.88rem", color: m.color }}>{m.name}</span>
                    </div>
                    <p style={{ fontSize: "0.81rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>{m.desc}</p>
                  </div>
                ))}
              </div>

              {/* ── Progress Bar & Other Metrics ── */}
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em",
                  color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                  Other Indicators
                </div>
                {[
                  { name: "Supply Coverage %",  desc: "The progress bar shows supply as a % of demand. 100% = fully covered. Red bar = critical gap. Green = good balance." },
                  { name: "Stations / Million",  desc: "Number of public EV charging stations per million residents. Low values indicate underserved population density." },
                  { name: "Population",          desc: "State population in millions (M). Used as a weight when sorting to highlight large high-gap states." },
                ].map(m => (
                  <div key={m.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--text-primary)" }}>{m.name}</span>
                    </div>
                    <p style={{ fontSize: "0.81rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>{m.desc}</p>
                  </div>
                ))}
              </div>

              {/* ── Sort & Filter ── */}
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em",
                  color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                  🔽 Sort & Filter Options
                </div>
                {[
                  { name: "Sort: Gap Score",    desc: "Orders states by their overall infrastructure deficit; worst states first." },
                  { name: "Sort: Demand",       desc: "Sorts by EV demand pressure; highlights states with highest future need." },
                  { name: "Sort: Supply",       desc: "Sorts by existing infrastructure capacity; lowest supply shown first." },
                  { name: "Sort: Population",   desc: "Orders by state population size; useful to prioritise large underserved states." },
                  { name: "Filter: Critical",   desc: "Shows only states with Gap Score > 30 (severe deficit)." },
                  { name: "Filter: Elevated",   desc: "Shows only states with Gap Score between 15 and 30." },
                  { name: "Filter: Balanced",   desc: "Shows only states with Gap Score ≤ 15 (good coverage)." },
                ].map(m => (
                  <div key={m.name} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 800,
                      color: "var(--text-secondary)",
                      background: "rgba(103,232,249,0.08)",
                      border: "1px solid rgba(103,232,249,0.2)",
                      padding: "2px 7px", borderRadius: 5,
                      whiteSpace: "nowrap", marginTop: 1, flexShrink: 0,
                    }}>{m.name}</span>
                    <span style={{ fontSize: "0.81rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{m.desc}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="data-card"><LoadingSkeleton rows={2} height="32px"/></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
          <KPICard label="Total States"        value={data.length}  sub="in dataset"           color="var(--text-secondary)" delay="0.05s"/>
          <KPICard label="Critical Deficit"    value={critical}     sub="gap score > 30"        color="var(--color-urgent)"   delay="0.10s"/>
          <KPICard label="Elevated Risk"       value={elevated}     sub="gap score 15–30"       color="var(--color-high)"     delay="0.15s"/>
          <KPICard label="Balanced Coverage"   value={balanced}     sub="gap score ≤ 15"        color="var(--color-good)"     delay="0.20s"/>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="data-card mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-bold shrink-0" style={{ color: "var(--text-primary)" }}>
          Filter:
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all",      label: "All States",   color: "var(--text-secondary)" },
            { key: "urgent",   label: "Critical",     color: "var(--color-urgent)"   },
            { key: "high",     label: "Elevated",     color: "var(--color-high)"     },
            { key: "moderate", label: "Balanced",     color: "var(--color-good)"     },
          ].map(({ key, label, color }) => (
            <button key={key} className="btn-filter"
                    onClick={() => setFilter(key)}
                    style={{
                      borderColor: color,
                      background: filter === key ? color : "transparent",
                      color: filter === key ? "var(--bg-deep)" : color,
                    }}>
              {label}
            </button>
          ))}
        </div>

        <select className="input-field ml-auto"
                style={{ width: "220px" }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}>
          <option value="gap_score">Sort: Gap Score</option>
          <option value="demand_score">Sort: Demand</option>
          <option value="supply_score">Sort: Supply</option>
          <option value="population">Sort: Population</option>
        </select>
      </div>

      {/* State Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="data-card">
              <LoadingSkeleton rows={4} height="24px"/>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {sorted.map((state, idx) => {
            const color = getColor(state.gap_score)
            const supplyPct = Math.min((state.supply_score / Math.max(state.demand_score, 1)) * 100, 100)
            return (
              <div key={state.state}
                   className="data-card fade-up"
                   style={{
                     borderLeft: `4px solid ${color}`,
                     opacity: 0,
                     animationDelay: `${Math.min(idx * 0.04, 0.5)}s`,
                   }}>
                {/* Header row */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-black text-lg" style={{ color: "var(--text-primary)" }}>
                      {state.state}
                    </div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Pop: {(state.population / 1e6).toFixed(1)}M
                    </div>
                  </div>
                  <span className="text-xs font-black px-2 py-1 rounded-md"
                        style={{
                          color,
                          background: getBadgeBg(state.gap_score),
                          border: `1px solid ${color}40`,
                          letterSpacing: "0.06em",
                        }}>
                    {getLabel(state.gap_score)}
                  </span>
                </div>

                {/* Score row */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl mb-4"
                     style={{ background: "var(--bg-deep)" }}>
                  <div>
                    <div className="label mb-1">Gap</div>
                    <div className="text-2xl font-black" style={{ color }}>
                      {state.gap_score}
                    </div>
                  </div>
                  <div style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "0.75rem" }}>
                    <div className="label mb-1">Demand</div>
                    <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {state.demand_score}
                    </div>
                  </div>
                  <div style={{ borderLeft: "1px solid var(--border-color)", paddingLeft: "0.75rem" }}>
                    <div className="label mb-1">Supply</div>
                    <div className="text-xl font-bold" style={{ color: "var(--text-secondary)" }}>
                      {state.supply_score}
                    </div>
                  </div>
                </div>

                {/* Supply fill bar */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                      Supply Coverage
                    </span>
                    <span className="text-xs font-black" style={{ color }}>
                      {supplyPct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden"
                       style={{ background: "var(--bg-deep)", border: "1px solid var(--border-color)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{ width: `${supplyPct}%`, background: color }}/>
                  </div>
                </div>

                {/* Stations per million */}
                <div className="mt-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  {state.stations_per_million} stations / million people
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <div className="data-card text-center py-16"
             style={{ color: "var(--text-muted)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <div className="font-bold">No states match the current filter</div>
        </div>
      )}
    </div>
  )
}