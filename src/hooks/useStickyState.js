import { useState, useEffect } from "react"

/**
 * useStickyState — A custom hook that works just like useState,
 * but it persists the value to sessionStorage.
 * This ensures form data isn't lost when navigating between pages.
 */
export default function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    const stickyValue = sessionStorage.getItem(key)
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
  })

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
