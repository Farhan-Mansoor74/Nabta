import CompanyHero from '@/components/companies/hero';
import CompanyBenefits from '@/components/companies/benefits';
import CompanyInfo from '@/components/companies/info';
import CompanyTestimonials from '@/components/companies/testimonials';
import CompanyPricing from '@/components/companies/pricing';
import CompanyFAQ from '@/components/companies/faq';
import CompanyCTA from '@/components/companies/cta';

export default function CompaniesPage() {
  return (
    <div className="pt-16 min-h-screen">
      <CompanyHero />
      <CompanyBenefits />
      <CompanyInfo />
      <CompanyTestimonials />
      <CompanyPricing />
      <CompanyFAQ />
      <CompanyCTA />
    </div>
  );
}