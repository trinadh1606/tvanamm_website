import React from 'react';
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
