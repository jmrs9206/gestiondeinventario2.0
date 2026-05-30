"use client";

import React from 'react';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import Navigation from '@/modules/materials/components/Navigation';
import OfficesTable from '@/modules/materials/components/OfficesTable';

export default function OfficesPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'TECNICO']}>
      <Navigation>
        <OfficesTable />
      </Navigation>
    </ProtectedRoute>
  );
}
