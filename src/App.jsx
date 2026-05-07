import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import Forecast  from "./pages/Forecast"
import GapMap    from "./pages/GapMap"
import Simulator from "./pages/Simulator"
import Charts    from "./pages/Charts"

const NAV_LINKS = [
  { to: "/",          label: "Forecast"  },
  { to: "/gap-map",   label: "Gap Map"   },
  { to: "/simulator", label: "Simulator" },
  { to: "/analytics", label: "Analytics" },
]

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("voltmap-theme") || "dark"
  )

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("voltmap-theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")
  const isDark = theme === "dark"

  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-deep)" }}>

        {/* ── Navbar ──────────────────────────────────────────────── */}
        <nav className="data-nav sticky top-0 z-50" style={{ height: "68px" }}>
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center gap-8">

            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: "linear-gradient(135deg, #4f46e5, #ec4899)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                        fill="white" strokeWidth="0"/>
                </svg>
              </div>
              <span className="font-black text-xl tracking-tight"
                    style={{ color: "var(--text-primary)" }}>
                Volt<span style={{ color: "var(--color-urgent)" }}>Map</span>
                <span className="text-sm font-medium ml-1"
                      style={{ color: "var(--text-muted)" }}>India</span>
              </span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-1 h-full">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  style={({ isActive }) => ({
                    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                    borderBottom: isActive
                      ? "2px solid var(--color-urgent)"
                      : "2px solid transparent",
                    padding: "0 14px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    textDecoration: "none",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.01em",
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Right side: status + theme toggle */}
            <div className="ml-auto flex items-center gap-3 shrink-0">
              {/* Live status */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse"
                     style={{ backgroundColor: "var(--color-good)" }}/>
                <span className="text-xs font-semibold"
                      style={{ color: "var(--text-muted)" }}>
                  Live · 2025–2050
                </span>
              </div>

              {/* Theme toggle */}
              <button
                id="theme-toggle-btn"
                onClick={toggleTheme}
                className="theme-toggle"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                <span className="theme-toggle-icon">
                  {isDark ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </span>
                {isDark ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Page Content ────────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/"          element={<Forecast theme={theme} />}  />
            <Route path="/gap-map"   element={<GapMap theme={theme} />}    />
            <Route path="/simulator" element={<Simulator theme={theme} />} />
            <Route path="/analytics" element={<Charts theme={theme} />}    />
          </Routes>
        </main>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <footer className="mt-16 border-t py-6 text-center text-xs"
                style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
          VoltMap India · ML-powered EV Infrastructure Analytics · Forecast horizon 2050
        </footer>
      </div>
    </BrowserRouter>
  )
}