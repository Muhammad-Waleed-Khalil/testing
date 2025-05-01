import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.tsx";
import { ToasterProvider } from "./provider/toast-provider.tsx";
import { setupAnalysisModels } from "./lib/analysis/init";
import ErrorBoundary from "./components/error-boundary";


// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Only run setupAnalysisModels in browser environment
if (typeof window !== 'undefined') {
  setupAnalysisModels();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY} 
        afterSignOutUrl="/"
      >
        <App />
        <ToasterProvider />
      </ClerkProvider>
    </ErrorBoundary>
  </StrictMode>
);
