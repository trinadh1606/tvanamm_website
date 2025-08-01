import React from 'react';
import StatisticsManagement from '@/components/dashboard/StatisticsManagement';

const StatisticsManagementPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Statistics Management</h1>
        <p className="text-muted-foreground mt-2">Manage site statistics and metrics</p>
      </div>
      <StatisticsManagement />
    </div>
  );
};

export default StatisticsManagementPage;