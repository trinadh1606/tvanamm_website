import React from 'react';
import { SEOEnhancer } from '@/components/SEO/SEOEnhancer';
import { StructuredData } from '@/components/SEO/StructuredData';
import HeroCarousel from '@/components/home/HeroCarousel';
import TopPicksSection from '@/components/home/TopPicksSection';
import MasterCatalogueSection from '@/components/home/MasterCatalogueSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import StatisticsSection from '@/components/home/StatisticsSection';
import LeadCapturePopup from '@/components/home/LeadCapturePopup';
import FranchiseInfoSection from '@/components/home/FranchiseInfoSection';
import MSMESection from '@/components/home/MSMESection';

const Index = () => {
  return (
    <>
      <SEOEnhancer
        title="T VANAMM - Premium Authentic Indian Tea & Franchise Opportunities"
        description="Discover premium authentic Indian tea directly from gardens. Join our franchise network and build your tea business with quality assurance, training, and support across India."
        keywords="premium tea, indian tea, authentic tea, tea franchise, franchise opportunities, assam tea, darjeeling tea, nilgiri tea, organic tea, traditional tea brewing"
        type="business"
      />
      <StructuredData type="organization" />
      <StructuredData type="local-business" />
      <div className="min-h-screen">
      {/* Hero Section */}
      <HeroCarousel />
      
      {/* Top Picks Section */}
      <TopPicksSection />
      
      {/* Master Catalogue Download Section */}
      <MasterCatalogueSection />
      
      {/* Statistics Section */}
      <StatisticsSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Franchise Information Section */}
      <FranchiseInfoSection />
      
      {/* MSME & Business Loan Support */}
      <MSMESection />
      
      {/* Lead Capture Popup */}
      <LeadCapturePopup />
      </div>
    </>
  );
};

export default Index;
