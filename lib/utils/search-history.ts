import type { RecentSearchItem } from '@/types/search'

const RECENT_SEARCHES_KEY = 'wink_recent_searches'
const MAX_RECENT_SEARCHES = 10

export function getRecentSearches(): RecentSearchItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): RecentSearchItem[] {
  if (typeof window === 'undefined') return []
  const clean = query.trim()
  if (!clean) return getRecentSearches()

  try {
    const existing = getRecentSearches()
    // Remove duplicate entry if it exists (case insensitive)
    const filtered = existing.filter(
      (item) => item.query.toLowerCase() !== clean.toLowerCase()
    )

    const newItem: RecentSearchItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      query: clean,
      timestamp: Date.now(),
    }

    const updated = [newItem, ...filtered].slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return getRecentSearches()
  }
}

export function removeRecentSearch(id: string): RecentSearchItem[] {
  if (typeof window === 'undefined') return []
  try {
    const existing = getRecentSearches()
    const updated = existing.filter((item) => item.id !== id)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return getRecentSearches()
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch {
    // Ignore error
  }
}
