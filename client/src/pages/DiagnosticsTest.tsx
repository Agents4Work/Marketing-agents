import { useState, useEffect } from "react";
import { RouteComponentProps } from "wouter";

interface EndpointStatus {
  name: string;
  url: string;
  status: 'success' | 'error' | 'loading';
  response?: any;
  error?: string;
}

export default function DiagnosticsTest(props: RouteComponentProps) {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { name: "Health Check", url: "/health", status: "loading" },
    { name: "API Test", url: "/api/test", status: "loading" },
    { name: "Simple Test", url: "/simple-test", status: "loading" }
  ]);
  const [serverInfo, setServerInfo] = useState<any>({});

  useEffect(() => {
    // Test all endpoints
    endpoints.forEach((endpoint, index) => {
      console.log(`Testing endpoint: ${endpoint.url}`);
      
      fetch(endpoint.url)
        .then(async (response) => {
          let data;
          try {
            // Try to parse as JSON first
            data = await response.clone().json();
          } catch (e) {
            // If not JSON, get text
            data = await response.text();
          }
          
          const updatedEndpoints = [...endpoints];
          updatedEndpoints[index] = {
            ...endpoint,
            status: response.ok ? "success" : "error",
            response: data
          };
          setEndpoints(updatedEndpoints);
        })
        .catch((error) => {
          console.error(`Error fetching ${endpoint.url}:`, error);
          const updatedEndpoints = [...endpoints];
          updatedEndpoints[index] = {
            ...endpoint,
            status: "error",
            error: error.toString()
          };
          setEndpoints(updatedEndpoints);
        });
    });
    
    // Get server info
    fetch("/api/test")
      .then(res => res.json())
      .then(data => {
        setServerInfo(data);
      })
      .catch(err => {
        console.error("Error fetching server info:", err);
      });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Marketing Platform - Diagnostics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Server Information</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(serverInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <div className="space-y-2">
            <div>
              <strong>React Version:</strong>{" "}
              {React.version}
            </div>
            <div>
              <strong>Browser:</strong>{" "}
              {navigator.userAgent}
            </div>
            <div>
              <strong>Current URL:</strong>{" "}
              {window.location.href}
            </div>
            <div>
              <strong>Current Time:</strong>{" "}
              {new Date().toISOString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
        
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <div key={endpoint.url} className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium flex items-center">
                {endpoint.name} ({endpoint.url})
                {endpoint.status === "loading" && <span className="ml-2 text-blue-500">⏳ Loading...</span>}
                {endpoint.status === "success" && <span className="ml-2 text-green-500">✅ Success</span>}
                {endpoint.status === "error" && <span className="ml-2 text-red-500">❌ Error</span>}
              </h3>
              
              {endpoint.status === "success" && (
                <div className="mt-2">
                  <h4 className="text-md font-medium">Response:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {typeof endpoint.response === "object" 
                      ? JSON.stringify(endpoint.response, null, 2) 
                      : endpoint.response}
                  </pre>
                </div>
              )}
              
              {endpoint.status === "error" && (
                <div className="mt-2">
                  <h4 className="text-md font-medium text-red-500">Error:</h4>
                  <pre className="bg-red-50 p-3 rounded text-sm text-red-600 overflow-auto">
                    {endpoint.error}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Test Links</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><a href="/" className="text-blue-600 hover:underline">Home</a></li>
          <li><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a></li>
          <li><a href="/simple-test" className="text-blue-600 hover:underline">Simple Test Endpoint</a></li>
          <li><a href="/test.html" className="text-blue-600 hover:underline">Static Test Page</a></li>
          <li><a href="/test-server" className="text-blue-600 hover:underline">Test Server HTML Page</a></li>
        </ul>
      </div>
    </div>
  );
}