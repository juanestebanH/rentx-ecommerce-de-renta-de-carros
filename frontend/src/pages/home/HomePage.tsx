import { HeroSection } from './HeroSection';
import { FeaturedVehicles } from './FeaturedVehicles';
import { WhyRentX } from './WhyRentX';
import { PopularCategories } from './PopularCategories';
import { HomeSteps } from './HomeSteps';
import { Testimonials } from './Testimonials';
import { Reveal } from './Reveal';

function HomePage() {
  return (
    <>
      <HeroSection />

      <Reveal>
        <FeaturedVehicles />
      </Reveal>
      <Reveal>
        <WhyRentX />
      </Reveal>
      <Reveal>
        <PopularCategories />
      </Reveal>
      <Reveal>
        <HomeSteps />
      </Reveal>
      <Reveal>
        <Testimonials />
      </Reveal>
    </>
  );
}

export default HomePage;
