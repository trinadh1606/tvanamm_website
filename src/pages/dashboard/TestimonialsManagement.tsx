import React from 'react';
import TestimonialsManagement from '@/components/dashboard/TestimonialsManagement';

const TestimonialsManagementPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Testimonials Management</h1>
        <p className="text-muted-foreground mt-2">Manage customer testimonials and reviews</p>
      </div>
      <TestimonialsManagement />
    </div>
  );
};

export default TestimonialsManagementPage;