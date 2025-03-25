import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";

// Add error handling for HMR and Vite client connection
console.log("Starting React application initialization...");

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Create query client for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

try {
  console.log("Checking for root element...");
  // Ensure root element exists
  const rootElement = document.getElementById("root") || (() => {
    console.log("Creating root element as it doesn't exist");
    const div = document.createElement("div");
    div.id = "root";
    document.body.appendChild(div);
    return div;
  })();

  console.log("Creating React root...");
  // Create the React root
  const root = createRoot(rootElement);

  console.log("Rendering React application...");
  // Render the app with providers
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  );

  // Log successful render  
  console.log("React application successfully rendered!");
} catch (error) {
  console.error("Failed to initialize React application:", error);
  
  // Create fallback UI if React fails to load
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 2rem;">
        <h1 style="color: #d00;">Application Error</h1>
        <p>The application failed to initialize. This may be due to a connection issue.</p>
        <p>Error details: ${error instanceof Error ? error.message : String(error)}</p>
        <button onclick="location.reload()">Reload Application</button>
      </div>
    `;
  }
}
