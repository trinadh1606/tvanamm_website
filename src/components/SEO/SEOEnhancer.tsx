import React from 'react';
import { SEOHead } from './SEOHead';
import { StructuredData } from './StructuredData';
import { useLocation } from 'react-router-dom';

interface SEOEnhancerProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  products?: Array<{
    name: string;
    description: string;
    price: number;
    image?: string;
    category?: string;
  }>;
  breadcrumbs?: Array<{ name: string; url: string }>;
  type?: 'website' | 'product' | 'business';
}

export const SEOEnhancer: React.FC<SEOEnhancerProps> = ({
  title,
  description,
  keywords,
  ogImage,
  products,
  breadcrumbs,
  type = 'website'
}) => {
  const location = useLocation();
  
  // Generate page-specific structured data
  const getStructuredDataType = () => {
    const path = location.pathname;
    
    if (path.includes('/order') && products) {
      return 'product';
    }
    if (path.includes('/franchise') || path.includes('/contact')) {
      return 'local-business';
    }
    return 'organization';
  };

  // Generate breadcrumbs from current path if not provided
  const generateBreadcrumbs = () => {
    if (breadcrumbs) return breadcrumbs;
    
    const pathParts = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ name: 'Home', url: '/' }];
    
    let currentPath = '';
    pathParts.forEach(part => {
      currentPath += `/${part}`;
      const name = part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' ');
      crumbs.push({ name, url: currentPath });
    });
    
    return crumbs;
  };

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        ogImage={ogImage}
      />
      
      {/* Organization Schema - Always present */}
      <StructuredData type="organization" />
      
      {/* Page-specific Schema */}
      <StructuredData 
        type={getStructuredDataType()} 
        products={products}
      />
      
      {/* Breadcrumb Schema */}
      <StructuredData 
        type="breadcrumb" 
        breadcrumbs={generateBreadcrumbs()}
      />
    </>
  );
};