import Nav from '../components/Nav.jsx'
import HeroScrub from '../components/HeroScrub.jsx'
import Stack from '../components/Stack.jsx'
import Comparison from '../components/Comparison.jsx'
import Reviews from '../components/Reviews.jsx'
import Shop from '../components/Shop.jsx'
import Faq from '../components/Faq.jsx'
import Social from '../components/Social.jsx'
import Footer from '../components/Footer.jsx'

export default function Home() {
  return (
    <main className="app">
      <Nav />
      <HeroScrub />
      <Stack />
      <Comparison />
      <Reviews />
      <Shop />
      <Faq />
      <Social />
      <Footer />
    </main>
  )
}
