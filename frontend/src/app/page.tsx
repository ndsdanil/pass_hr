import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import HowItWorks from './components/sections/HowItWorks';
import Tools from './components/sections/Tools';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Tools />
      <HowItWorks />
      <Footer />
    </>
  );
}
