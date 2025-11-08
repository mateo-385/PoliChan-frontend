import React from 'react'
import { parseContentWithMentions } from '@/lib/mentions'

interface MentionTextProps {
  content: string
  className?: string
  validMentions?: string[] // List of usernames that have valid mentions
}

/**
 * Component to render text with @mentions highlighted in a different color
 * Only mentions that exist in validMentions array will be styled
 * If validMentions is not provided, all @usernames are styled
 * Mentions will be styled with blue color and slightly bold font
 */
export function MentionText({
  content,
  className = '',
  validMentions,
}: MentionTextProps) {
  const parts = parseContentWithMentions(content)

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (typeof part === 'string') {
          return (
            <React.Fragment key={idx}>
              {part.split('\n').map((line, lineIdx) => (
                <React.Fragment key={lineIdx}>
                  {line}
                  {lineIdx < part.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </React.Fragment>
          )
        }

        // It's a mention object
        // Only style if validMentions is not provided OR if this mention is in validMentions list
        const isValidMention =
          !validMentions || validMentions.includes(part.username)

        return (
          <span
            key={`mention-${part.index}`}
            className={
              isValidMention
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : ''
            }
          >
            @{part.username}
          </span>
        )
      })}
    </span>
  )
}
