"use client";

import React from 'react';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import Navigation from '@/modules/materials/components/Navigation';
import AuditLogsTable from '@/modules/materials/components/AuditLogsTable';

export default function AuditPage() {
  return (
    <ProtectedRoute requiredPermission="READ_AUDIT_LOG">
      <Navigation>
        <AuditLogsTable />
      </Navigation>
    </ProtectedRoute>
  );
}
