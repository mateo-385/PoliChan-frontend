# WebSocket Implementation Guide

## Overview

This project implements WebSocket support for real-time communication between the frontend and backend. The WebSocket connection is established at `ws://localhost:3000/ws`.

## Architecture

### Files Created

- `src/services/websocket.service.ts` - WebSocket service singleton
- `src/contexts/WebSocketContext.ts` - WebSocket React context
- `src/contexts/WebSocketProvider.tsx` - WebSocket provider component
- `src/hooks/use-websocket.ts` - Custom hook to use WebSocket
- `src/types/websocket.types.ts` - TypeScript types for WebSocket messages
- `src/components/websocket/WebSocketStatus.tsx` - Status indicator component

## Features

### Auto-Reconnection

- Automatically reconnects on connection loss
- 5 retry attempts with 3-second delay between attempts
- Prevents reconnection loops

### Message Handling

- Type-safe message structure
- Multiple subscribers support
- Easy cleanup with unsubscribe functions

### Connection Status

- Real-time connection status tracking
- Visual indicator in the UI (bottom-right corner)

## Usage

### 1. Configuration

Add the WebSocket URL to your `.env` file:

```bash
VITE_WS_URL=ws://localhost:3000/ws
```

### 2. Using the WebSocket Hook

```typescript
import { useWebSocket } from '@/hooks/use-websocket'

function MyComponent() {
  const { isConnected, sendMessage } = useWebSocket()

  const handleSendMessage = () => {
    sendMessage({
      type: 'my_message_type',
      data: 'Hello WebSocket!',
    })
  }

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  )
}
```

### 3. Listening to Messages

```typescript
import { useEffect } from 'react'
import { websocketService } from '@/services/websocket.service'

function MyComponent() {
  useEffect(() => {
    // Subscribe to messages
    const unsubscribe = websocketService.onMessage((data) => {
      console.log('Message received:', data)

      // Handle different message types
      switch (data.type) {
        case 'user_registered':
          console.log('New user:', data.message)
          break
        case 'new_post':
          console.log('New post created:', data)
          break
        // Add more cases as needed
      }
    })

    // Cleanup on unmount
    return unsubscribe
  }, [])

  return <div>Listening to WebSocket messages...</div>
}
```

### 4. Adding New Message Types

Update `src/types/websocket.types.ts`:

```typescript
export interface NewPostMessage extends WebSocketMessage {
  type: 'new_post'
  postId: string
  author: string
  content: string
}
```

## Current Message Types

### user_registered

Sent when a new user registers on the platform.

**Structure:**

```json
{
  "type": "user_registered",
  "message": "New user registered",
  "userName": "username123"
}
```

## Example: Handling User Registration Messages

The `WebSocketProvider` already handles user registration messages:

```typescript
// In WebSocketProvider.tsx
websocketService.onMessage((data) => {
  if (data.type === 'user_registered') {
    console.log('New user registered:', data.message)
    // You can show a toast notification or update UI here
  }
})
```

## Integration Points

### App.tsx

The WebSocket provider wraps the entire application:

```typescript
<AuthProvider>
  <WebSocketProvider>
    <Routes>{/* Your routes */}</Routes>
  </WebSocketProvider>
</AuthProvider>
```

### FeedPage.tsx

The feed page displays the WebSocket connection status indicator.

## Troubleshooting

### Connection Issues

1. Verify the backend WebSocket server is running at `ws://localhost:3000/ws`
2. Check browser console for connection errors
3. Ensure no CORS issues on the backend
4. Check if the backend URL in `.env` is correct

### Message Not Received

1. Verify the message type matches the expected format
2. Check if the subscriber is properly registered
3. Ensure the WebSocket connection is established (check status indicator)

### Auto-Reconnect Not Working

- The service stops reconnecting after 5 failed attempts
- Refresh the page to reset the connection attempts
- Check backend availability

## Best Practices

1. **Always unsubscribe**: Use the cleanup function returned by `onMessage()`
2. **Type safety**: Define message types in `websocket.types.ts`
3. **Error handling**: Wrap message handlers in try-catch blocks
4. **Connection checks**: Verify connection before sending messages
5. **Resource cleanup**: Disconnect when component unmounts (already handled by provider)

## Future Enhancements

Consider implementing:

- Message queuing for offline messages
- Heartbeat/ping-pong for connection health
- Authentication with JWT token in WebSocket connection
- Message acknowledgment system
- Selective message subscriptions by topic/channel
