import React from 'react';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import Navigation from '@/modules/materials/components/Navigation';
import RolesPermissionsTable from '@/modules/materials/components/RolesPermissionsTable';

export default function SettingsPage() {
  return (
    <ProtectedRoute requiredPermission="MANAGE_ROLES">
      <Navigation>
        <RolesPermissionsTable />
      </Navigation>
    </ProtectedRoute>
  );
}
