import React from 'react';
import { Helmet } from 'react-helmet-async';

interface Product {
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
}

interface StructuredDataProps {
  type: 'organization' | 'product' | 'breadcrumb' | 'local-business';
  data?: any;
  products?: Product[];
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export const StructuredData: React.FC<StructuredDataProps> = ({
  type,
  data,
  products,
  breadcrumbs
}) => {
  const generateSchema = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "T VANAMM",
          "description": "Premium Authentic Indian Tea & Franchise Opportunities",
          "url": "https://tvanamm.com",
          "logo": "https://tvanamm.com/logo.png",
          "foundingDate": "2020",
          "legalName": "T VANAMM",
          "slogan": "Authentic Indian Tea Experience",
          "contactPoint": [
            {
              "@type": "ContactPoint",
              "telephone": "+91-9000008479",
              "contactType": "Customer Service",
              "areaServed": "IN",
              "availableLanguage": ["English", "Hindi", "Telugu"]
            },
            {
              "@type": "ContactPoint",
              "telephone": "+91-9390658544",
              "contactType": "Franchise Inquiries",
              "areaServed": "IN"
            }
          ],
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Kukatpally",
            "addressRegion": "Telangana",
            "addressCountry": "IN",
            "postalCode": "500072"
          },
          "sameAs": [
            "https://facebook.com/tvanamm",
            "https://instagram.com/tvanamm",
            "https://twitter.com/tvanamm"
          ],
          "knowsAbout": [
            "Tea Manufacturing",
            "Franchise Business",
            "Indian Tea",
            "Organic Tea",
            "Premium Tea Blends"
          ]
        };

      case 'local-business':
        return {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "T VANAMM",
          "description": "Premium Indian Tea Franchise Network",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Kukatpally",
            "addressLocality": "Hyderabad",
            "addressRegion": "Telangana",
            "postalCode": "500072",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "17.4875",
            "longitude": "78.4095"
          },
          "telephone": "+91-9000008479",
          "openingHours": "Mo-Su 07:00-23:00",
          "priceRange": "₹₹",
          "servesCuisine": "Tea, Coffee, Beverages",
          "hasMenu": "https://tvanamm.com/order",
          "acceptsReservations": false,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "150"
          }
        };

      case 'product':
        if (!products || products.length === 0) return null;
        
        if (products.length === 1) {
          const product = products[0];
          return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "brand": {
              "@type": "Brand",
              "name": "T VANAMM"
            },
            "category": product.category || "Tea",
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "seller": {
                "@type": "Organization",
                "name": "T VANAMM"
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.7",
              "reviewCount": "25"
            }
          };
        } else {
          return {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "T VANAMM Premium Tea Collection",
            "numberOfItems": products.length,
            "itemListElement": products.map((product, index) => ({
              "@type": "Product",
              "position": index + 1,
              "name": product.name,
              "description": product.description,
              "brand": {
                "@type": "Brand",
                "name": "T VANAMM"
              },
              "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock"
              }
            }))
          };
        }

      case 'breadcrumb':
        if (!breadcrumbs || breadcrumbs.length === 0) return null;
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": `https://tvanamm.com${crumb.url}`
          }))
        };

      default:
        return data;
    }
  };

  const schema = generateSchema();
  
  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};