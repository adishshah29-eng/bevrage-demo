import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import HeroLab from './pages/HeroLab.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hero" element={<HeroLab />} />
      </Routes>
    </BrowserRouter>
  )
}
