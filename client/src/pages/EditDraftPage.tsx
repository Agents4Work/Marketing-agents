'use client';

import { useEffect } from 'react';
import { RouteComponentProps } from 'wouter';
import EditDraft from '@/components/EditDraft';

export default function EditDraftPage(_props: RouteComponentProps) {
  useEffect(() => {
    // Set document title
    document.title = 'Edit Draft | AI Marketing Platform';
  }, []);

  return <EditDraft />;
}