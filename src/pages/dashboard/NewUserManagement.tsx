import React from 'react';
import NewUserManagement from '@/components/dashboard/NewUserManagement';

export default function NewUserManagementPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">Manage new user signups and role assignments</p>
      </div>
      <NewUserManagement />
    </div>
  );
}