import { useCallback, useState } from 'react'
import { SearchSuggestion } from '@real/app/lib/types'
import { apiClient } from '../apiClient'

export function useSearchData() {
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const loadSearch = useCallback(async (query: string) => {
    const normalized = query.trim()
    if (!normalized) {
      setSearchSuggestions([])
      setSearchError(null)
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    setSearchError(null)
    try {
      const result = await apiClient.search.query(normalized)
      setSearchSuggestions(result.suggestions)
    } catch (loadError) {
      setSearchError(
        loadError instanceof Error ? loadError.message : 'Unable to fetch search results.',
      )
      setSearchSuggestions([])
    } finally {
      setSearchLoading(false)
    }
  }, [])

  const submitSearch = useCallback(
    (query: string) => {
      setActiveSearchQuery(query)
      void loadSearch(query)
    },
    [loadSearch],
  )

  return {
    activeSearchQuery,
    searchSuggestions,
    searchLoading,
    searchError,
    submitSearch,
    loadSearch,
  }
}
