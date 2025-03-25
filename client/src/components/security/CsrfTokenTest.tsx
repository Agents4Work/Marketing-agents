import { useState } from 'react';
import { useCsrfToken } from '@/contexts/CsrfContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function CsrfTokenTest() {
  const { csrfToken, isTokenValid, loading, refreshToken } = useCsrfToken();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Test the CSRF token by making a request to a protected endpoint
  const testCsrfProtection = async () => {
    setTestLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/security/secure-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({ test: 'data' })
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          message: `CSRF protection working! Server response: ${JSON.stringify(data)}`
        });
      } else {
        const errorData = await response.json();
        setTestResult({
          success: false,
          message: `Error: ${errorData.message || response.statusText}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Test without a valid CSRF token to verify protection
  const testWithoutToken = async () => {
    setTestLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/security/secure-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Deliberately omit the CSRF token
        },
        body: JSON.stringify({ test: 'data' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setTestResult({
          success: true, // This is actually a success for our test
          message: `CSRF protection confirmed! Request rejected as expected: ${errorData.message || response.statusText}`
        });
      } else {
        const data = await response.json();
        setTestResult({
          success: false,
          message: `Security concern: Request succeeded without CSRF token! Response: ${JSON.stringify(data)}`
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          CSRF Protection Test
          <Badge variant={isTokenValid ? "default" : "destructive"}>
            {isTokenValid ? "Valid Token" : "No Valid Token"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test the Cross-Site Request Forgery (CSRF) protection implemented on the server.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-md">
          <div className="font-mono text-sm break-all">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading token...</span>
              </div>
            ) : csrfToken ? (
              csrfToken
            ) : (
              <span className="text-muted-foreground">No token available</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => refreshToken()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Token
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="default"
              className="w-full"
              onClick={testCsrfProtection}
              disabled={!isTokenValid || testLoading}
            >
              {testLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test With Token
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={testWithoutToken}
              disabled={testLoading}
            >
              {testLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Test Without Token
            </Button>
          </div>
        </div>

        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
            </div>
            <AlertDescription className="mt-2 text-sm">
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="bg-muted/50 text-sm text-muted-foreground">
        <p>CSRF tokens help protect your application from cross-site request forgery attacks.</p>
      </CardFooter>
    </Card>
  );
}