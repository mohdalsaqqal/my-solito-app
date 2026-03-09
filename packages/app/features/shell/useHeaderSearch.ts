import { Platform } from 'react-native'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchSearchPayloadMock,
  SearchDiscovery,
  SearchSuggestion,
} from './searchMock'

const RECENT_KEY = 'header_recent_searches'
const MAX_RECENTS = 8
const DEBOUNCE_MS = 180

let memoryRecents: string[] = []

function readRecents(): string[] {
  const storage = (globalThis as { localStorage?: { getItem: (key: string) => string | null } })
    ?.localStorage
  if (!storage) {
    return memoryRecents
  }

  try {
    const raw = storage.getItem(RECENT_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function writeRecents(next: string[]) {
  memoryRecents = next
  const storage = (globalThis as {
    localStorage?: { setItem: (key: string, value: string) => void }
  })?.localStorage
  if (!storage) {
    return
  }
  try {
    storage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // Keep in-memory fallback only.
  }
}

function pushRecent(query: string, current: string[]) {
  const normalized = query.trim()
  if (!normalized) {
    return current
  }

  const withoutDup = current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())
  return [normalized, ...withoutDup].slice(0, MAX_RECENTS)
}

export function useHeaderSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [discovery, setDiscovery] = useState<SearchDiscovery>({
    trendingSearches: [],
    popularBrands: [],
  })
  const [recents, setRecents] = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setRecents(readRecents())
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setError(null)
      const normalized = query.trim()

      if (Platform.OS !== 'web') {
        void fetchSearchPayloadMock(normalized)
          .then((fallback) => {
            setSuggestions(fallback.suggestions)
            setDiscovery(fallback.discovery)
            setError(null)
          })
          .catch(() => {
            setSuggestions([])
            setError('SUGGESTIONS_UNAVAILABLE')
          })
          .finally(() => {
            setLoading(false)
          })
        return
      }

      const encoded = encodeURIComponent(normalized)
      const path = `/api/search?q=${encoded}`

      void fetch(path, { credentials: 'include' })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('SEARCH_NETWORK_ERROR')
          }
          const json = (await response.json()) as
            | {
                success: true
                data: {
                  suggestions: SearchSuggestion[]
                  trendingSearches: string[]
                  popularBrands: string[]
                }
              }
            | { success: false; error: { code: string; message: string } }

          if (!json.success) {
            throw new Error(json.error.code)
          }

          setSuggestions(json.data.suggestions)
          setDiscovery({
            trendingSearches: json.data.trendingSearches,
            popularBrands: json.data.popularBrands,
          })
        })
        .catch(async () => {
          try {
            const fallback = await fetchSearchPayloadMock(normalized)
            setSuggestions(fallback.suggestions)
            setDiscovery(fallback.discovery)
            setError(null)
          } catch {
            setSuggestions([])
            setError('SUGGESTIONS_UNAVAILABLE')
          }
        })
        .finally(() => {
          setLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [open, query])

  const hasResults = useMemo(() => suggestions.length > 0 || recents.length > 0, [suggestions.length, recents.length])

  const selectSuggestion = (item: SearchSuggestion) => {
    setQuery(item.label)
    const next = pushRecent(item.label, recents)
    setRecents(next)
    writeRecents(next)
    setOpen(false)
  }

  const selectRecent = (value: string) => {
    setQuery(value)
    setOpen(false)
  }

  const commitSearch = () => {
    const next = pushRecent(query, recents)
    setRecents(next)
    writeRecents(next)
    setOpen(false)
  }

  const clearRecents = () => {
    setRecents([])
    writeRecents([])
  }

  return {
    query,
    setQuery,
    open,
    setOpen,
    loading,
    error,
    suggestions,
    discovery,
    recents,
    hasResults,
    selectSuggestion,
    selectRecent,
    commitSearch,
    clearRecents,
  }
}
