import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Nearby from '../components/Nearby'
import Amenities from '../components/Amenities'
import Gallery from '../components/Gallery'
import Location from '../components/Location'
import FAQ from '../components/FAQ'
import FinalCta from '../components/FinalCta'
import Footer from '../components/Footer'
import StickyMobileCta from '../components/StickyMobileCta'

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Nearby />
      <Amenities />
      <Gallery />
      <Location />
      <FAQ />
      <FinalCta />
      <Footer />
      <StickyMobileCta />
    </div>
  )
}
