import { useEffect, useState, useRef } from 'react'
import { mentionsRepository } from '@/repositories/mentions.repository'

// Simple in-memory cache for mention data
const mentionCache = new Map<
  string,
  {
    mentions: string[]
    timestamp: number
  }
>()

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Hook to fetch and cache post mentions
 * Returns cached data if available and fresh, otherwise fetches from server
 * @param postId - The post ID to fetch mentions for
 * @returns Array of mentioned usernames
 */
export function useMentions(postId: string): string[] {
  const [mentions, setMentions] = useState<string[]>([])
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    const fetchMentions = async () => {
      // Check cache first
      const cached = mentionCache.get(postId)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setMentions(cached.mentions)
        return
      }

      try {
        const response = await mentionsRepository.getPostMentions(postId)

        // Extract unique usernames from mentions
        const usernames = [
          ...new Set(
            response.mentions
              .map((m) => m.mentionedUser?.username)
              .filter(Boolean) as string[]
          ),
        ]

        // Update cache
        mentionCache.set(postId, {
          mentions: usernames,
          timestamp: Date.now(),
        })

        setMentions(usernames)
      } catch (error) {
        console.error('Failed to fetch mentions:', error)
        setMentions([])
      }
    }

    fetchMentions()
  }, [postId])

  return mentions
}

/**
 * Prefetch mentions for multiple posts
 * Useful for timeline/list views to reduce loading delays
 * @param postIds - Array of post IDs to prefetch
 */
export async function prefetchMentions(postIds: string[]): Promise<void> {
  const uncachedIds = postIds.filter((id) => {
    const cached = mentionCache.get(id)
    return !cached || Date.now() - cached.timestamp >= CACHE_DURATION
  })

  // Fetch uncached mentions in parallel, but don't block the UI
  uncachedIds.forEach((postId) => {
    mentionsRepository
      .getPostMentions(postId)
      .then((response) => {
        const usernames = [
          ...new Set(
            response.mentions
              .map((m) => m.mentionedUser?.username)
              .filter(Boolean) as string[]
          ),
        ]
        mentionCache.set(postId, {
          mentions: usernames,
          timestamp: Date.now(),
        })
      })
      .catch((error) => {
        console.error(`Failed to prefetch mentions for post ${postId}:`, error)
      })
  })
}

/**
 * Clear the entire mention cache
 * Useful when you need to refresh all mention data
 */
export function clearMentionCache(): void {
  mentionCache.clear()
}

/**
 * Clear cache for a specific post
 * @param postId - The post ID to clear from cache
 */
export function clearMentionCacheForPost(postId: string): void {
  mentionCache.delete(postId)
}
