import { useState, useEffect, useRef } from "react"

/**
 * InfoButton — a small ⓘ icon that opens an explanation popover.
 *
 * Props:
 *   title       {string}  — short heading inside the popover
 *   description {string}  — full explanation paragraph
 */
export default function InfoButton({ title, description }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      {/* ⓘ trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Show chart info"
        title="What is this chart?"
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "1.5px solid var(--border-color)",
          background: open ? "var(--color-model1)" : "var(--toggle-bg)",
          color: open ? "var(--bg-deep)" : "var(--text-muted)",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          transition: "all 0.2s ease",
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--color-model1)"
            e.currentTarget.style.color = "var(--color-model1)"
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = "var(--border-color)"
            e.currentTarget.style.color = "var(--text-muted)"
          }
        }}
      >
        i
      </button>

      {/* Popover */}
      {open && (
        <div
          className="info-popover"
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            zIndex: 200,
            width: 300,
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "14px",
            padding: "16px 18px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            animation: "fadeUp 0.2s ease-out forwards",
          }}
        >
          {/* Arrow */}
          <div style={{
            position: "absolute",
            top: -7,
            right: 8,
            width: 12,
            height: 12,
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderBottom: "none",
            borderRight: "none",
            transform: "rotate(45deg)",
            borderRadius: "2px 0 0 0",
          }}/>

          {/* Title */}
          <div style={{
            fontSize: "0.8rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--color-model1)",
            marginBottom: "8px",
          }}>
            {title}
          </div>

          {/* Description */}
          <p style={{
            fontSize: "0.875rem",
            lineHeight: 1.65,
            color: "var(--text-secondary)",
            margin: 0,
            fontWeight: 500,
          }}>
            {description}
          </p>

          {/* Close hint */}
          <div style={{
            marginTop: "12px",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            textAlign: "right",
          }}>
            Click anywhere to close
          </div>
        </div>
      )}
    </div>
  )
}
