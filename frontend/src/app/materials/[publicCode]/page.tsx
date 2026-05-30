"use client";

import React, { use } from 'react';
import ProtectedRoute from '@/modules/auth/components/ProtectedRoute';
import Navigation from '@/modules/materials/components/Navigation';
import MaterialDetail from '@/modules/materials/components/MaterialDetail';

interface PageProps {
  params: Promise<{
    publicCode: string;
  }>;
}

export default function MaterialDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  
  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'TECNICO']}>
      <Navigation>
        <MaterialDetail publicCode={resolvedParams.publicCode} />
      </Navigation>
    </ProtectedRoute>
  );
}
