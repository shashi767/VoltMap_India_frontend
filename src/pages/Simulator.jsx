import { useState, useEffect } from "react"
import axios from "axios"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts"
import KPICard from "../components/KPICard"
import LoadingSkeleton from "../components/LoadingSkeleton"
import InfoButton from "../components/InfoButton"
import useStickyState from "../hooks/useStickyState"

const API = "https://voltmap-india-backend.onrender.com"

const SimTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-sm" style={{ minWidth: 160 }}>
      <div className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-3 mb-1">
          <span style={{ color: p.fill, fontWeight: 600 }}>{p.name}</span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>{p.value} pts</span>
        </div>
      ))}
    </div>
  )
}

export default function Simulator() {
  const [states,      setStates]      = useState([])
  const [multiplier,  setMultiplier]  = useStickyState(1.4, "sim-multiplier")
  const [budget,      setBudget]      = useStickyState(50000, "sim-budget")
  const [focusStates, setFocusStates] = useStickyState([], "sim-focus")
  const [targetYear,  setTargetYear]  = useStickyState(2035, "sim-target")
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [legendOpen,  setLegendOpen]  = useState(false)

  useEffect(() => {
    axios.get(`${API}/api/states-list`).then(r => setStates(r.data))
  }, [])

  useEffect(() => {
    if (states.length === 0) return
    let active = true
    async function run() {
      setLoading(true)
      try {
        const res = await axios.post(`${API}/api/scenario`, {
          growth_multiplier : multiplier,
          budget,
          focus_states      : focusStates,
          target_year       : targetYear,
        })
        if (active) setResult(res.data)
      } catch (e) {
        console.error("Simulator error", e)
      }
      if (active) setLoading(false)
    }
    const t = setTimeout(run, 400)
    return () => { active = false; clearTimeout(t) }
  }, [multiplier, budget, focusStates, targetYear, states.length])

  function toggleState(s) {
    setFocusStates(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const resolvedCount = result?.states?.filter(s => s.gap_after < s.gap_before).length || 0
  const totalGapBefore = result?.states?.reduce((sum, s) => sum + Math.max(0, s.gap_before), 0) || 0
  const totalGapAfter  = result?.states?.reduce((sum, s) => sum + Math.max(0, s.gap_after),  0) || 0
  const rawReduction = totalGapBefore > 0
    ? Math.min(100, Math.max(-999, ((totalGapBefore - totalGapAfter) / totalGapBefore) * 100))
    : 0
  const isGapIncrease = rawReduction < 0
  const displayGapStr = Math.abs(rawReduction).toFixed(1)

  return (
    <div className="fade-up" style={{ opacity: 0 }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
          Scenario Simulator
        </h1>
        <p className="text-base font-medium" style={{ color: "var(--text-muted)" }}>
          Model infrastructure investment outcomes · Target any year up to 2050
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              
              {/* ── Parameters ── */}
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em",
                  color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                  Policy Parameters
                </div>
                {[
                  { name: "Demand Growth Multiplier", desc: "Simulates accelerated or conservative EV adoption relative to the baseline forecast. (e.g. 1.5× means demand grows 50% faster)." },
                  { name: "Charging Station Budget", desc: "The total number of new charging stations available to be built and distributed across India." },
                  { name: "Target Year", desc: "The future year for which all simulation outcomes and gap deficits are calculated." },
                  { name: "Focus States", desc: "Selecting specific states gives them absolute priority in the algorithmic distribution of the charging station budget." },
                ].map(m => (
                  <div key={m.name} style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--text-primary)", marginBottom: 3 }}>
                      {m.name}
                    </div>
                    <p style={{ fontSize: "0.81rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>{m.desc}</p>
                  </div>
                ))}
              </div>

              {/* ── Metrics ── */}
              <div>
                <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em",
                  color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
                  Outcome Metrics
                </div>
                {[
                  { name: "Baseline Forecast", color: "var(--color-model1)", desc: "The expected total EV registrations for the Target Year under normal historical growth trends." },
                  { name: "Scenario Forecast", color: "var(--color-model2)", desc: "The new projected total EV registrations after applying your Demand Growth Multiplier." },
                  { name: "Gap Reduction / Increase", color: "var(--text-primary)", desc: "Measures whether your Budget successfully met the Scenario demand. A green 'Reduction' means the supply gap narrowed. A red 'Increase' means demand outpaced your infrastructure budget." },
                  { name: "Before / After Chart", color: "var(--text-primary)", desc: "Red bars show the gap before interventions. Green bars show the gap after. Shorter green bars indicate successful mitigation." },
                ].map(m => (
                  <div key={m.name} style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.88rem", color: m.color, marginBottom: 3 }}>
                      {m.name}
                    </div>
                    <p style={{ fontSize: "0.81rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.55 }}>{m.desc}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 items-start">

        {/* ── Controls Panel ────────────────────────────────────── */}
        <div className="data-card space-y-6">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Policy Parameters
          </h2>

          {/* Demand Multiplier */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="label m-0">Demand Growth Multiplier</span>
              <strong style={{ color: "var(--color-model1)", fontWeight: 800 }}>
                {multiplier}×
              </strong>
            </div>
            <input type="range" min="0.8" max="2.5" step="0.1"
                   value={multiplier}
                   onChange={e => setMultiplier(parseFloat(e.target.value))}
                   style={{ accentColor: "var(--color-model1)" }}/>
            <div className="flex justify-between mt-1 text-xs font-semibold"
                 style={{ color: "var(--text-muted)" }}>
              <span>Conservative (0.8×)</span>
              <span>Hyper (2.5×)</span>
            </div>
          </div>

          {/* Budget */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="label m-0">Charging Station Budget</span>
              <strong style={{ color: "var(--color-good)", fontWeight: 800 }}>
                {budget.toLocaleString()} stations
              </strong>
            </div>
            <input type="range" min="10000" max="200000" step="5000"
                   value={budget}
                   onChange={e => setBudget(parseInt(e.target.value))}
                   style={{ accentColor: "var(--color-good)" }}/>
            <div className="flex justify-between mt-1 text-xs font-semibold"
                 style={{ color: "var(--text-muted)" }}>
              <span>10K units</span>
              <span>200K units</span>
            </div>
          </div>

          {/* Target Year */}
          <div>
            <span className="label">Target Year</span>
            <select className="input-field" value={targetYear}
                    onChange={e => setTargetYear(parseInt(e.target.value))}>
              {Array.from({ length: 26 }, (_, i) => 2025 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Focus States */}
          <div>
            <span className="label">
              Focus States
              {focusStates.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-black"
                      style={{ background: "var(--color-model1)", color: "var(--bg-deep)" }}>
                  {focusStates.length}
                </span>
              )}
            </span>
            <div className="mt-1 rounded-xl overflow-y-auto"
                 style={{
                   maxHeight: 200,
                   background: "var(--bg-deep)",
                   border: "1px solid var(--border-color)",
                 }}>
              {states.map(s => {
                const isChecked = focusStates.includes(s)
                return (
                  <label key={s}
                         className="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors"
                         style={{
                           color: isChecked ? "var(--text-primary)" : "var(--text-muted)",
                           background: isChecked ? "rgba(250,204,21,0.07)" : "transparent",
                           fontWeight: isChecked ? 700 : 500,
                           fontSize: "0.88rem",
                         }}>
                    <input type="checkbox" checked={isChecked}
                           onChange={() => toggleState(s)}
                           style={{ accentColor: "var(--color-model1)", width: 16, height: 16 }}/>
                    {s}
                  </label>
                )
              })}
            </div>
            {focusStates.length > 0 && (
              <button onClick={() => setFocusStates([])}
                      className="mt-2 text-xs font-bold"
                      style={{ color: "var(--color-urgent)", background: "none", border: "none", cursor: "pointer" }}>
                Clear all ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Results Panel ──────────────────────────────────────── */}
        <div>
          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-sm font-semibold mb-4"
                 style={{ color: "var(--color-model1)" }}>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>
              Running simulation for {targetYear}…
            </div>
          )}

          {result ? (
            <div className="space-y-5">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                <KPICard
                  label="Baseline Forecast"
                  value={`${(result.baseline_forecast / 1e6).toFixed(2)}M`}
                  sub={`${targetYear} registrations`}
                  color="var(--color-model1)"
                  delay="0.05s"
                />
                <KPICard
                  label="Scenario Forecast"
                  value={`${(result.scenario_forecast / 1e6).toFixed(2)}M`}
                  sub="projected demand"
                  color="var(--color-model2)"
                  delay="0.10s"
                />
                <KPICard
                  label="Demand Uplift"
                  value={`+${((multiplier - 1) * 100).toFixed(0)}%`}
                  sub="market pressure"
                  color="var(--color-high)"
                  delay="0.15s"
                />
                <KPICard
                  label={isGapIncrease ? "Gap Increase" : "Gap Reduction"}
                  value={isGapIncrease ? `+${displayGapStr}%` : `${displayGapStr}%`}
                  sub={isGapIncrease ? "deficit worsened" : `${resolvedCount} states improved`}
                  color={isGapIncrease ? "var(--color-urgent)" : "var(--color-good)"}
                  delay="0.20s"
                />
              </div>

              {/* Before/After Chart */}
              <div className="data-card">
                <div className="flex items-center gap-2 mb-5">
                  <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                    Before / After Gap Score — Top 15 States
                  </h2>
                  <InfoButton
                    title="Before / After Gap Score"
                    description="This horizontal bar chart compares each state's EV infrastructure gap score before and after applying your simulation parameters. The red bars show the current deficit (how far supply lags behind demand), while the green bars show the projected gap after budget allocation and growth multiplier are applied. States are ranked by their pre-simulation gap. A shorter green bar means the investment successfully narrows the infrastructure deficit for that state."
                  />
                </div>
                <ResponsiveContainer width="100%" height={460}>
                  <BarChart data={result.states.slice(0, 15)}
                            layout="vertical"
                            margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false}
                                   stroke="var(--border-color)" opacity={0.5}/>
                    <XAxis type="number"
                           tick={{ fontSize: 12, fill: "var(--text-muted)", fontWeight: 600 }}
                           tickLine={false} axisLine={false}/>
                    <YAxis type="category" dataKey="state" width={115}
                           tick={{ fontSize: 12, fill: "var(--text-primary)", fontWeight: 700 }}
                           axisLine={false} tickLine={false}/>
                    <Tooltip content={<SimTooltip />} cursor={{ fill: "rgba(79,70,229,0.08)" }}/>
                    <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13, fontWeight: 700 }}
                            iconType="circle"/>
                    <Bar dataKey="gap_before" name="Gap Before"
                         fill="var(--color-urgent)" radius={[0, 6, 6, 0]} barSize={14}/>
                    <Bar dataKey="gap_after"  name="Gap After"
                         fill="var(--color-good)"   radius={[0, 6, 6, 0]} barSize={14}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            !loading && (
              <div className="data-card flex flex-col items-center justify-center py-24 gap-3"
                   style={{ color: "var(--text-muted)" }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.45">
                  <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
                  <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
                  <line x1="17" y1="16" x2="23" y2="16"/>
                </svg>
                <div className="font-bold text-lg">Awaiting simulation parameters</div>
                <div className="text-sm">Adjust the controls to run a scenario</div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}