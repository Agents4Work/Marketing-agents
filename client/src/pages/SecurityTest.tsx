import { useEffect } from 'react';
import CsrfTokenTest from '@/components/security/CsrfTokenTest';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SecurityTest() {
  // Set page title on mount
  useEffect(() => {
    document.title = 'Security Test - AI Marketing Platform';
  }, []);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Security Features Test</h1>
        <p className="text-muted-foreground">Test and verify the security features implemented in this application</p>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">CSRF Protection</h2>
          <p className="text-muted-foreground mb-6">
            Cross-Site Request Forgery (CSRF) protection prevents attackers from tricking users into 
            submitting requests they didn't intend to make. This test verifies our token-based CSRF protection.
          </p>
          <CsrfTokenTest />
        </div>
      </div>
    </div>
  );
}