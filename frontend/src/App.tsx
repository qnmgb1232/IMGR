import { BrowserRouter } from 'react-router-dom'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-2xl font-bold text-center animate-[fadeIn_0.6s_ease-out]">
              <span className="bg-gradient-to-r from-red-500 via-orange-500 to-blue-500 bg-clip-text text-transparent">
                IMGR - I Must Get Rich!
              </span>
            </h1>
          </div>
        </header>
        <main className="px-4 py-3 animate-[slideUp_0.5s_ease-out]">
          <Dashboard />
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
