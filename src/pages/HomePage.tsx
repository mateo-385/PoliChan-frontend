import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-background to-muted">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold">PoliChan</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to your application
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors border"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}
