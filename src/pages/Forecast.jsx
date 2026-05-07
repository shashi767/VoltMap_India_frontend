import { useState, useEffect } from "react"
import axios from "axios"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine
} from "recharts"
import KPICard from "../components/KPICard"
import LoadingSkeleton from "../components/LoadingSkeleton"
import InfoButton from "../components/InfoButton"
import DateRangeSlider from "../components/DateRangeSlider"
import useStickyState from "../hooks/useStickyState"

const API = "https://voltmap-india-backend.onrender.com"

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-sm" style={{ minWidth: 180 }}>
      <div className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color, fontWeight: 600 }}>{p.name}</span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
            {(p.value / 1000).toFixed(0)}K EVs
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Forecast({ theme }) {
  const isDark = theme === "dark"
  const prophetColor = isDark ? "sky blue" : "yellow"
  const ridgeColor = isDark ? "neon violet" : "pink"

  const [startDate, setStartDate] = useStickyState("2025-01", "forecast-start")
  const [endDate,   setEndDate]   = useStickyState("2050-12", "forecast-end")
  const [model,     setModel]     = useStickyState("both", "forecast-model")
  const [data,      setData]      = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let active = true
    async function runForecast() {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.post(`${API}/api/forecast`, {
          start_date : startDate + "-01",
          end_date   : endDate   + "-01",
          model,
        })
        if (!active) return

        const prophetData = res.data.prophet || []
        const ridgeData   = res.data.ridge   || []

        if (model === "prophet") {
          setData(prophetData.map(p => ({
            date   : p.date.slice(0, 7),
            prophet: p.value,
            p_lower: p.lower,
            p_upper: p.upper,
          })))
        } else if (model === "ridge") {
          setData(ridgeData.map(r => ({
            date   : r.date.slice(0, 7),
            ridge  : r.value,
            r_lower: r.lower,
            r_upper: r.upper,
          })))
        } else {
          setData(prophetData.map((p, i) => ({
            date   : p.date.slice(0, 7),
            prophet: p.value,
            ridge  : ridgeData[i]?.value,
            p_lower: p.lower,
            p_upper: p.upper,
          })))
        }
      } catch (e) {
        if (active) setError("Failed to fetch forecast. Is the backend running?")
        console.error(e)
      }
      if (active) setLoading(false)
    }

    const t = setTimeout(runForecast, 300)
    return () => { active = false; clearTimeout(t) }
  }, [startDate, endDate, model])

  const lastPoint = data?.length ? data[data.length - 1] : null
  const firstPoint = data?.length ? data[0] : null

  // Compute growth for KPI
  const prophetGrowth = lastPoint && firstPoint && lastPoint.prophet && firstPoint.prophet
    ? (((lastPoint.prophet - firstPoint.prophet) / firstPoint.prophet) * 100).toFixed(0)
    : null

  return (
    <div className="fade-up" style={{ opacity: 0 }}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
          Trajectory Forecast
        </h1>
        <p className="text-base font-medium" style={{ color: "var(--text-muted)" }}>
          ML-powered EV registration predictions · Prophet + Polynomial Ridge · Dynamic to 2050
        </p>
      </div>

      {/* Controls */}
      <div className="data-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-2">
            <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: 6 }}>
              <span className="label" style={{ margin: 0 }}>Forecast Timeline</span>
              <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>(Drag thumbs to adjust)</span>
            </div>
            <DateRangeSlider 
              startMonth={startDate} 
              endMonth={endDate} 
              onStartChange={setStartDate} 
              onEndChange={setEndDate} 
            />
          </div>
          <div>
            <span className="label">Forecast Engine</span>
            <select className="input-field" value={model}
                    onChange={e => setModel(e.target.value)}>
              <option value="both">Both Models</option>
              <option value="prophet">Prophet Only</option>
              <option value="ridge">Ridge Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="data-card mb-6 border-l-4 text-sm font-semibold flex items-center gap-2"
             style={{ borderColor: "var(--color-urgent)", color: "var(--color-urgent)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {lastPoint && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
          {model !== "ridge" && lastPoint.prophet > 0 && (
            <KPICard
              label={`Prophet · ${endDate.split('-')[0]} Target`}
              value={`${((lastPoint.prophet || 0) / 1000).toFixed(0)}K`}
              sub="monthly registrations"
              color="var(--color-model1)"
              delay="0.05s"
            />
          )}
          {model !== "prophet" && lastPoint.ridge > 0 && (
            <KPICard
              label={`Ridge · ${endDate.split('-')[0]} Target`}
              value={`${((lastPoint.ridge || 0) / 1000).toFixed(0)}K`}
              sub="monthly registrations"
              color="var(--color-model2)"
              delay="0.10s"
            />
          )}
          {prophetGrowth && model !== "ridge" && (
            <KPICard
              label="Forecast Growth"
              value={`+${prophetGrowth}%`}
              sub="over selected period"
              color="var(--color-good)"
              delay="0.15s"
            />
          )}
          <KPICard
            label="Data Points"
            value={(data?.length || 0).toLocaleString()}
            sub="monthly intervals"
            color="var(--text-secondary)"
            delay="0.20s"
          />
        </div>
      )}

      {/* Chart */}
      <div className="data-card relative">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Monthly EV Registration Forecast
          </h2>
          <div className="flex items-center gap-4">
            {loading && (
              <div className="flex items-center gap-2 text-sm font-semibold"
                   style={{ color: "var(--color-model1)" }}>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                Computing…
              </div>
            )}
            <InfoButton
              title="Monthly EV Registration Forecast"
              description={`This area chart projects India's monthly EV (Electric Vehicle) registrations from your selected start date up to 2050. The ${prophetColor} Prophet line uses a time-series decomposition model that captures seasonality and trend, while the ${ridgeColor} Ridge line uses Polynomial Ridge Regression. The shaded area shows uncertainty. A vertical reference line marks the year 2030 as a key policy milestone.`}
            />
          </div>
        </div>

        {loading && !data && (
          <LoadingSkeleton rows={4} height="60px" />
        )}

        {data && (
          <ResponsiveContainer width="100%" height={460}>
            <AreaChart data={data} margin={{ top: 25, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradProphet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#facc15" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gradRidge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f472b6" stopOpacity={0.20}/>
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false}
                             stroke="var(--border-color)" opacity={0.5}/>
              <XAxis dataKey="date"
                     tick={{ fontSize: 12, fill: "var(--text-muted)", fontWeight: 600 }}
                     tickLine={false} axisLine={false} tickMargin={10} minTickGap={40}/>
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
                     tick={{ fontSize: 12, fill: "var(--text-muted)", fontWeight: 600 }}
                     tickLine={false} axisLine={false} tickMargin={10} width={50}/>
              <Tooltip content={<CustomTooltip />}/>
              <Legend
                iconType="circle"
                wrapperStyle={{
                  paddingTop: 20, fontSize: 13, fontWeight: 700,
                  color: "var(--text-secondary)"
                }}
              />

              {/* Reference line at 2030 */}
              <ReferenceLine x="2030-01"
                stroke="var(--border-color)" strokeDasharray="4 4"
                label={{ value: "2030", fill: "var(--text-muted)", fontSize: 11, position: "top" }}
              />

              {model !== "ridge" && (
                <Area type="monotone" dataKey="prophet"
                      name="Prophet" stroke="#facc15" strokeWidth={2.5}
                      fill="url(#gradProphet)" dot={false}
                      activeDot={{ r: 6, stroke: "#facc15", strokeWidth: 2, fill: "#0f0e1a" }}/>
              )}
              {model !== "prophet" && (
                <Area type="monotone" dataKey="ridge"
                      name="Ridge" stroke="#f472b6" strokeWidth={2.5}
                      strokeDasharray="8 4" fill="url(#gradRidge)" dot={false}
                      activeDot={{ r: 6, stroke: "#f472b6", strokeWidth: 2, fill: "#0f0e1a" }}/>
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {!loading && !data && !error && (
          <div className="flex items-center justify-center h-48"
               style={{ color: "var(--text-muted)" }}>
            Select a date range to begin forecast
          </div>
        )}
      </div>
    </div>
  )
}