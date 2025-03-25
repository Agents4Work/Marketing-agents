import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCsrfToken } from '@/contexts/CsrfContext';

export default function ApiTest() {
  const { csrfToken, refreshToken } = useCsrfToken();
  const [healthStatus, setHealthStatus] = useState<string>('Not checked');
  const [csrfStatus, setCsrfStatus] = useState<string>('Not checked');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Test the health endpoint
  const checkHealth = async () => {
    setLoading(true);
    setHealthStatus('Checking...');
    setError(null);
    
    try {
      console.log('Sending request to /api/health');
      const response = await fetch('/api/health');
      console.log('Response received:', response);
      
      if (response.ok) {
        const data = await response.json();
        setHealthStatus(`Healthy - ${data.timestamp}`);
      } else {
        setHealthStatus(`Error ${response.status} - ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error checking health:', err);
      setHealthStatus('Failed to connect');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Test the CSRF token endpoint
  const checkCsrfToken = async () => {
    setLoading(true);
    setCsrfStatus('Checking...');
    setError(null);
    
    try {
      console.log('Sending request to /api/csrf-token');
      const response = await fetch('/api/csrf-token');
      console.log('Response received:', response);
      
      if (response.ok) {
        const data = await response.json();
        setCsrfStatus(`Token received: ${data.csrfToken ? data.csrfToken.substring(0, 10) + '...' : 'none'}`);
      } else {
        setCsrfStatus(`Error ${response.status} - ${response.statusText}`);
      }
    } catch (err) {
      console.error('Error checking CSRF token:', err);
      setCsrfStatus('Failed to connect');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Refresh CSRF token from provider
  const handleRefreshToken = async () => {
    setLoading(true);
    setCsrfStatus('Refreshing...');
    setError(null);
    
    try {
      const token = await refreshToken();
      setCsrfStatus(`Token refreshed: ${token ? token.substring(0, 10) + '...' : 'none'}`);
    } catch (err) {
      console.error('Error refreshing token:', err);
      setCsrfStatus('Failed to refresh');
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Log current token from context
  useEffect(() => {
    console.log('Current CSRF token from context:', csrfToken);
  }, [csrfToken]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Health Check</CardTitle>
          <CardDescription>Test connection to the API health endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-muted">
            <p><strong>Status:</strong> {healthStatus}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={checkHealth} disabled={loading}>Check Health</Button>
        </CardFooter>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>CSRF Token Test</CardTitle>
          <CardDescription>Test fetching a CSRF token directly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg bg-muted">
            <p><strong>Status:</strong> {csrfStatus}</p>
            <Separator className="my-4" />
            <p><strong>Current Token:</strong> {csrfToken ? csrfToken.substring(0, 10) + '...' : 'No token'}</p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={checkCsrfToken} disabled={loading}>
            Check CSRF Token
          </Button>
          <Button onClick={handleRefreshToken} disabled={loading} variant="outline">
            Refresh Token
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-800 mt-6">
          <h3 className="font-bold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}

      <div className="mt-8 p-4 border rounded-lg bg-muted">
        <h3 className="font-bold mb-2">Debug Information</h3>
        <p><strong>Browser URL:</strong> {window.location.href}</p>
        <p><strong>API Base:</strong> {window.location.origin}</p>
      </div>
    </div>
  );
}