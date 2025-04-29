import Hero from '@/components/home/hero';
import FeaturedOpportunities from '@/components/home/featured-opportunities';
import Impact from '@/components/home/impact';
import HowItWorks from '@/components/home/how-it-works';
import Testimonials from '@/components/home/testimonials';
import Partners from '@/components/home/partners';
import CTA from '@/components/home/cta';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <FeaturedOpportunities />
      <Impact />
      <HowItWorks />
      <Testimonials />
      <Partners />
      <CTA />
    </div>
  );
}