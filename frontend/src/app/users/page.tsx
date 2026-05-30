"use client";

import React from 'react';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import Navigation from '@/modules/materials/components/Navigation';
import UsersTable from '@/modules/materials/components/UsersTable';

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Navigation>
        <UsersTable />
      </Navigation>
    </ProtectedRoute>
  );
}
