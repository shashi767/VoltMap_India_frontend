import { useState, useEffect, useRef } from "react"

const MIN_YEAR = 2025
const MAX_YEAR = 2050
const TOTAL_MONTHS = (MAX_YEAR - MIN_YEAR + 1) * 12 - 1

function monthToIndex(dateStr) {
  if (!dateStr) return 0
  const [y, m] = dateStr.split('-')
  return (parseInt(y) - MIN_YEAR) * 12 + (parseInt(m) - 1)
}

function indexToMonth(idx) {
  const y = MIN_YEAR + Math.floor(idx / 12)
  const m = (idx % 12) + 1
  return `${y}-${m.toString().padStart(2, '0')}`
}

function formatDisplay(dateStr) {
  if (!dateStr) return ""
  const [y, m] = dateStr.split('-')
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${months[parseInt(m)-1]} ${y}`
}

export default function DateRangeSlider({ startMonth, endMonth, onStartChange, onEndChange }) {
  const [startIdx, setStartIdx] = useState(() => monthToIndex(startMonth))
  const [endIdx, setEndIdx] = useState(() => monthToIndex(endMonth))

  // Sync external state changes
  useEffect(() => {
    setStartIdx(monthToIndex(startMonth))
    setEndIdx(monthToIndex(endMonth))
  }, [startMonth, endMonth])

  const handleStartChange = (e) => {
    const val = Math.min(parseInt(e.target.value), endIdx - 1)
    setStartIdx(val)
    onStartChange(indexToMonth(val))
  }

  const handleEndChange = (e) => {
    const val = Math.max(parseInt(e.target.value), startIdx + 1)
    setEndIdx(val)
    onEndChange(indexToMonth(val))
  }

  const leftPercent = (startIdx / TOTAL_MONTHS) * 100
  const rightPercent = 100 - (endIdx / TOTAL_MONTHS) * 100

  return (
    <div style={{ width: "100%", paddingTop: "8px" }}>
      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "-8px", fontSize: "0.85rem", fontWeight: 800 }}>
        <div style={{ color: "var(--color-model1)" }}>{formatDisplay(startMonth)}</div>
        <div style={{ color: "var(--color-model1)" }}>{formatDisplay(endMonth)}</div>
      </div>

      <div className="dual-slider-container">
        {/* Track & Fill */}
        <div className="dual-slider-track">
          <div className="dual-slider-fill"
               style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }} />
        </div>

        {/* Start Thumb */}
        <input 
          type="range" 
          min={0} 
          max={TOTAL_MONTHS} 
          value={startIdx} 
          onChange={handleStartChange}
          className="dual-slider-input"
        />
        
        {/* End Thumb */}
        <input 
          type="range" 
          min={0} 
          max={TOTAL_MONTHS} 
          value={endIdx} 
          onChange={handleEndChange}
          className="dual-slider-input"
        />
      </div>

      {/* Axis markers */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 700, marginTop: "-4px" }}>
        <span>2025</span>
        <span>2030</span>
        <span>2035</span>
        <span>2040</span>
        <span>2045</span>
        <span>2050</span>
      </div>
    </div>
  )
}
