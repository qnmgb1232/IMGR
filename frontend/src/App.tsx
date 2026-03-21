import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Predictions from './pages/Predictions'
import Trends from './pages/Trends'
import Distribution from './pages/Distribution'
import Sidebar from './components/Sidebar'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-bg-primary">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/distribution" element={<Distribution />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
