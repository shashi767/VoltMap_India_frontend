/**
 * KPICard — premium KPI display card.
 * Props:
 *   label    : string
 *   value    : string | number
 *   sub      : subtitle string (optional)
 *   color    : CSS color string (default gold)
 *   accentTop: show top accent border (default true)
 *   icon     : emoji or string (optional)
 *   delay    : animation delay (e.g. "0.1s")
 */
export default function KPICard({
  label,
  value,
  sub,
  color = "var(--text-primary)",
  accentTop = true,
  icon,
  delay = "0s",
}) {
  return (
    <div
      className="data-card fade-up flex flex-col gap-1"
      style={{
        borderTop: accentTop ? `3px solid ${color}` : undefined,
        animationDelay: delay,
        opacity: 0,
      }}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span style={{ fontSize: "1.1rem" }}>{icon}</span>
        )}
        <span className="label">{label}</span>
      </div>

      <div
        className="font-black mt-1"
        style={{
          fontSize: "2.4rem",
          color,
          textShadow: `0 0 20px ${color}55`,
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      {sub && (
        <div
          className="text-xs font-semibold mt-1"
          style={{ color: "var(--text-muted)" }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}
