/**
 * LoadingSkeleton — animated shimmer placeholder.
 * Props:
 *   rows     : number of skeleton rows (default 3)
 *   height   : height of each row (default "20px")
 *   className: extra Tailwind classes
 */
export default function LoadingSkeleton({
  rows = 3,
  height = "20px",
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height,
            width: i === rows - 1 ? "60%" : "100%",
            opacity: 1 - i * 0.15,
          }}
        />
      ))}
    </div>
  )
}
