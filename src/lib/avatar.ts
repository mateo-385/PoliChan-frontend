/**
 * Generate a consistent avatar URL based on user ID
 * Using DiceBear API for generating avatars
 */
export function getAvatarUrl(
  userId: string,
  style: 'initials' | 'shapes' = 'initials'
): string {
  // Using DiceBear API - free and no attribution required
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${userId}`
}

/**
 * Generate a consistent background color based on user ID
 * Returns a hex color code
 */
export function getAvatarColor(userId: string): string {
  // Generate a hash from the user ID
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Generate RGB values with good contrast
  const colors = [
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#F59E0B', // amber
    '#10B981', // emerald
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#F97316', // orange
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#EF4444', // red
    '#A855F7', // purple
  ]

  return colors[Math.abs(hash) % colors.length]
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return `${first}${last}`.trim() || '?'
}
