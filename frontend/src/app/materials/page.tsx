"use client";

import React from 'react';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import Navigation from '@/modules/materials/components/Navigation';
import MaterialsTable from '@/modules/materials/components/MaterialsTable';

export default function MaterialsPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'TECNICO']}>
      <Navigation>
        <MaterialsTable />
      </Navigation>
    </ProtectedRoute>
  );
}
