"use client";

import React from 'react';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import Navigation from '@/modules/materials/components/Navigation';
import AuditLogsTable from '@/modules/materials/components/AuditLogsTable';

export default function AuditPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Navigation>
        <AuditLogsTable />
      </Navigation>
    </ProtectedRoute>
  );
}
