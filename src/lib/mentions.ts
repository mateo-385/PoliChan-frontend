import type { ParsedMention } from '@/types/mentions.types'

/**
 * Extract @mentions from content using regex
 * Matches: @username where username is 1-30 alphanumeric characters or underscores
 * @param content - The text content to search for mentions
 * @returns Array of mentioned usernames
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_]{1,30})/g
  const matches = [...content.matchAll(mentionRegex)]
  return matches.map((match) => match[1])
}

/**
 * Extract mentions with their positions in the text
 * Used for rendering mentions with styling
 * @param content - The text content to search for mentions
 * @returns Array of mentions with positions
 */
export function extractMentionsWithPositions(content: string): ParsedMention[] {
  const mentionRegex = /@([a-zA-Z0-9_]{1,30})/g
  const mentions: ParsedMention[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      username: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    })
  }

  return mentions
}

/**
 * Parse content and return JSX-compatible array of text and mention elements
 * Used for rendering content with styled mentions
 * @param content - The text content to parse
 * @returns Array of text strings and mention objects for rendering
 */
export function parseContentWithMentions(
  content: string
): (string | { type: 'mention'; username: string; index: number })[] {
  const mentions = extractMentionsWithPositions(content)

  if (mentions.length === 0) {
    return [content]
  }

  const parts: (
    | string
    | { type: 'mention'; username: string; index: number }
  )[] = []
  let lastIndex = 0

  mentions.forEach((mention, idx) => {
    // Add text before this mention
    if (lastIndex < mention.startIndex) {
      parts.push(content.substring(lastIndex, mention.startIndex))
    }

    // Add the mention
    parts.push({
      type: 'mention',
      username: mention.username,
      index: idx,
    })

    lastIndex = mention.endIndex
  })

  // Add any remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex))
  }

  return parts
}

/**
 * Get unique mention usernames (removes duplicates)
 * @param content - The text content to search for mentions
 * @returns Array of unique mentioned usernames
 */
export function getUniqueMentions(content: string): string[] {
  return [...new Set(extractMentions(content))]
}

/**
 * Check if content contains mentions
 * @param content - The text content to check
 * @returns True if content contains at least one mention
 */
export function hasMentions(content: string): boolean {
  return extractMentions(content).length > 0
}

/**
 * Replace @mentions in content with formatted links/text
 * (Useful for server-side rendering or API calls)
 * @param content - The text content
 * @param formatter - Function to format each mention
 * @returns Formatted content
 */
export function formatMentions(
  content: string,
  formatter: (username: string) => string
): string {
  const mentionRegex = /@([a-zA-Z0-9_]{1,30})/g
  return content.replace(mentionRegex, (_match, username) => {
    return formatter(username)
  })
}

/**
 * Highlight mentions in content (for display purposes)
 * Returns HTML with mentions wrapped in span with class
 * @param content - The text content
 * @param className - CSS class to apply to mentions
 * @returns HTML string with mentions highlighted
 */
export function highlightMentions(
  content: string,
  className: string = 'text-blue-500 font-semibold'
): string {
  const mentionRegex = /@([a-zA-Z0-9_]{1,30})/g
  return content.replace(mentionRegex, `<span class="${className}">@$1</span>`)
}
