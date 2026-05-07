import { useEffect, useState } from "react"
import axios from "axios"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts"
import LoadingSkeleton from "../components/LoadingSkeleton"
import InfoButton from "../components/InfoButton"

const API = "https://voltmap-india-backend.onrender.com"

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-sm" style={{ minWidth: 160 }}>
      <div className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-3 mb-1">
          <span style={{ color: p.color || p.fill, fontWeight: 600 }}>{p.name}</span>
          <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
            {p.value?.toLocaleString()} EVs
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Charts() {
  const [historical, setHistorical] = useState([])
  const [yearly,     setYearly]     = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/api/historical`),
      axios.get(`${API}/api/yearly-forecast`),  // ← dynamic 2025–2050
    ]).then(([histRes, yearRes]) => {
      // Aggregate monthly historical → yearly totals
      const byYear = {}
      histRes.data.forEach(row => {
        if (!byYear[row.year]) byYear[row.year] = 0
        byYear[row.year] += row.value
      })
      setHistorical(
        Object.entries(byYear)
          .map(([year, total]) => ({ year: parseInt(year), total }))
          .sort((a, b) => a.year - b.year)
      )
      setYearly(yearRes.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const peak2050 = yearly.find(d => d.Year === 2050)
  const peak2030 = yearly.find(d => d.Year === 2030)

  // Combined timeline: historical + forecast
  const combined = [
    ...historical.map(d => ({ year: d.year, historical: d.total })),
    ...yearly.map(d => ({ year: d.Year, forecast: d.Forecast })),
  ]

  return (
    <div className="fade-up space-y-6" style={{ opacity: 0 }}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black mb-2" style={{ color: "var(--text-primary)" }}>
          Analytics
        </h1>
        <p className="text-base font-medium" style={{ color: "var(--text-muted)" }}>
          Historical EV registrations · Ridge-model forecast 2025–2050 · India overview
        </p>
      </div>

      {/* KPI Row */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="data-card"><LoadingSkeleton rows={2} height="28px"/></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
          {[
            {
              label: "Historical Records",
              value: `${historical.length} yrs`,
              sub: `${historical[0]?.year} – ${historical[historical.length - 1]?.year}`,
              color: "var(--text-secondary)",
            },
            {
              label: "Forecast at 2030",
              value: peak2030 ? `${peak2030.Forecast_M}M` : "—",
              sub: "annual EV registrations",
              color: "var(--color-model1)",
            },
            {
              label: "Forecast at 2050",
              value: peak2050 ? `${peak2050.Forecast_M}M` : "—",
              sub: "annual EV registrations",
              color: "var(--color-urgent)",
            },
          ].map((d, i) => (
            <div key={i} className="data-card fade-up"
                 style={{ borderTop: `3px solid ${d.color}`, opacity: 0, animationDelay: `${i * 0.08}s` }}>
              <span className="label">{d.label}</span>
              <div className="text-3xl font-black mt-1" style={{ color: d.color }}>{d.value}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: "var(--text-muted)" }}>{d.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart 1: Historical Growth */}
      <div className="data-card">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            India EV Registrations — Historical Growth
          </h2>
          <InfoButton
            title="Historical EV Growth"
            description="This area chart shows actual EV (Electric Vehicle) registration counts in India across historical years. Each data point represents the total yearly registrations aggregated from monthly records. The upward trend reflects India's accelerating EV adoption, driven by government incentives (FAME scheme), falling battery costs, and growing consumer demand. Use this to understand the real-world baseline before forecast projections begin."
          />
        </div>
        {loading ? <LoadingSkeleton rows={5} height="40px"/> : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historical} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradHist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#67e8f9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#67e8f9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false}
                             stroke="var(--border-color)" opacity={0.5}/>
              <XAxis dataKey="year"
                     tick={{ fontSize: 12, fill: "var(--text-muted)", fontWeight: 600 }}
                     tickLine={false} axisLine={false} tickMargin={8}/>
              <YAxis tickFormatter={v => `${(v / 1e6).toFixed(1)}M`}
                     tick={{ fontSize: 12, fill: "var(--text-muted)", fontWeight: 600 }}
                     tickLine={false} axisLine={false} tickMargin={8} width={48}/>
              <Tooltip content={<DarkTooltip />}/>
              <Area type="monotone" dataKey="total" name="Registrations"
                    stroke="var(--text-secondary)" strokeWidth={2.5}
                    fill="url(#gradHist)"
                    dot={{ r: 3, fill: "var(--text-secondary)", stroke: "none" }}
                    activeDot={{ r: 6, stroke: "var(--text-secondary)", strokeWidth: 2, fill: "var(--bg-deep)" }}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart 2: Yearly Forecast 2025–2050 */}
      <div className="data-card">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Ridge Model Forecast — Annual Totals 2025–2050
          </h2>
          <InfoButton
            title="Ridge Model Forecast (2025–2050)"
            description="This grouped bar chart shows the Ridge Regression model's annual EV registration predictions for each year from 2025 to 2050. The gold bars show the central forecast, while the pink and green bars show the lower and upper confidence bounds respectively. Polynomial Ridge Regression captures the non-linear growth pattern of EV adoption while penalising model complexity to avoid overfitting on historical data."
          />
        </div>
        {loading ? <LoadingSkeleton rows={5} height="40px"/> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}
                             stroke="var(--border-color)" opacity={0.5}/>
              <XAxis dataKey="Year"
                     tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 600 }}
                     tickLine={false} axisLine={false} tickMargin={8} minTickGap={20}/>
              <YAxis tickFormatter={v => `${(v / 1e6).toFixed(0)}M`}
                     tick={{ fontSize: 12, fill: "var(--text-muted)", fontWeight: 600 }}
                     tickLine={false} axisLine={false} tickMargin={8} width={48}/>
              <Tooltip content={<DarkTooltip />}/>
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13, fontWeight: 700 }}
                      iconType="circle"/>
              <Bar dataKey="Forecast" name="Annual Forecast"
                   fill="var(--color-model1)" radius={[4, 4, 0, 0]} barSize={14}/>
              <Bar dataKey="Lower"    name="Lower Bound"
                   fill="var(--color-model2)" radius={[4, 4, 0, 0]} barSize={14} opacity={0.7}/>
              <Bar dataKey="Upper"    name="Upper Bound"
                   fill="var(--color-good)" radius={[4, 4, 0, 0]} barSize={14} opacity={0.7}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart 3: Full Combined Timeline */}
      <div className="data-card">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Full Timeline — Historical + Forecast
          </h2>
          <InfoButton
            title="Full Timeline — Historical + Forecast"
            description="This side-by-side bar chart stitches together real historical EV registration data (cyan/blue bars) with Ridge model forecast data (gold bars) into one continuous timeline. It lets you visually compare where India has been versus where it is projected to go. The clear inflection point between historical and forecast bars shows the scale of growth expected as EV infrastructure matures through 2050."
          />
        </div>
        <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
          Cyan = actual registrations · Gold = Ridge model projection
        </p>
        {loading ? <LoadingSkeleton rows={5} height="40px"/> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={combined} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}
                             stroke="var(--border-color)" opacity={0.5}/>
              <XAxis dataKey="year"
                     tick={{ fontSize: 11, fill: "var(--text-muted)", fontWeight: 600 }}
                     tickLine={false} axisLine={false} tickMargin={8} minTickGap={8}/>
              <YAxis tickFormatter={v => `${(v / 1e6).toFixed(1)}M`}
                     tick={{ fontSize: 12, fill: "var(--text-muted)", fontWeight: 600 }}
                     tickLine={false} axisLine={false} tickMargin={8} width={52}/>
              <Tooltip content={<DarkTooltip />}/>
              <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13, fontWeight: 700 }}
                      iconType="circle"/>
              <Bar dataKey="historical" name="Historical" fill="var(--text-secondary)"
                   radius={[3, 3, 0, 0]} barSize={10}/>
              <Bar dataKey="forecast"   name="Forecast"   fill="var(--color-model1)"
                   radius={[3, 3, 0, 0]} barSize={10}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}