/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LenisProvider } from './components/LenisProvider';
import { GetInTouchModalProvider } from './components/GetInTouchModal';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PortfolioSection from './components/PortfolioSection';
import WhyWorkWithMeSection from './components/WhyWorkWithMeSection';
import ServicesSection from './components/ServicesSection';
import AwardsSection from './components/AwardsSection';
import ClientBlurSection from './components/ClientBlurSection';
import TestimonialsSection from './components/TestimonialsSection';
import FAQSection from './components/FAQSection';
import FooterSection from './components/FooterSection';

export default function App() {
  return (
    <LenisProvider>
      <GetInTouchModalProvider>
        <div className="elenavoss-body">
          <Header />
          <HeroSection />
          <PortfolioSection />
          <WhyWorkWithMeSection />
          <ServicesSection />
          <AwardsSection />
          <ClientBlurSection />
          <TestimonialsSection />
          <FAQSection />
          <FooterSection />
        </div>
      </GetInTouchModalProvider>
    </LenisProvider>
  );
}

