import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  schema?: object;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'T VANAMM - Premium Authentic Indian Tea & Franchise Opportunities',
  description = 'Discover premium authentic Indian tea directly from gardens. Join our franchise network and build your tea business with quality assurance, training, and support.',
  keywords = 'premium tea, indian tea, authentic tea, tea franchise, franchise opportunities, assam tea, darjeeling tea, nilgiri tea, tea business, quality tea',
  ogImage = '/tea-og-image.webp',
  canonicalUrl,
  schema
}) => {
  const location = useLocation();
  const currentUrl = canonicalUrl || `https://tvanamm.com${location.pathname}`;
  const fullOgImageUrl = ogImage.startsWith('http') ? ogImage : `https://tvanamm.com${ogImage}`;
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "T VANAMM",
    "description": "Premium Authentic Indian Tea & Franchise Opportunities",
    "url": "https://tvanamm.com",
    "logo": "https://tvanamm.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-XXXXXXXXXX",
      "contactType": "Customer Service"
    },
    "sameAs": [
      "https://facebook.com/tvanamm",
      "https://instagram.com/tvanamm"
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#8B4513" />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="T VANAMM" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImageUrl} />
      <meta name="twitter:site" content="@tvanamm" />
      <meta name="twitter:creator" content="@tvanamm" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Additional SEO meta tags */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="language" content="en" />
      <meta name="author" content="T VANAMM" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
    </Helmet>
  );
};