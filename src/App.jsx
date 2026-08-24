import Nav from './components/Nav.jsx'
import HeroScrub from './components/HeroScrub.jsx'
import Stack from './components/Stack.jsx'
import Shop from './components/Shop.jsx'
import Social from './components/Social.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <main className="app">
      <Nav />
      <HeroScrub />
      <Stack />
      <Shop />
      <Social />
      <Footer />
    </main>
  )
}
