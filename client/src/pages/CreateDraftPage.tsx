'use client';

import { useEffect } from 'react';
import { RouteComponentProps } from 'wouter';
import CreateDraft from '@/components/CreateDraft';

export default function CreateDraftPage(_props: RouteComponentProps) {
  useEffect(() => {
    // Set document title
    document.title = 'Create New Draft | AI Marketing Platform';
  }, []);

  return <CreateDraft />;
}