import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Workflow from "./pages/Workflow";
import LegoWorkflow from "./pages/LegoWorkflow";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/not-found";
import ContentHub from "./pages/ContentHub";
import AITools from "./pages/AITools";
import AIWorkflows from "./pages/AIWorkflows";
import AIAnalyzer from "./pages/AIAnalyzer";
import AIPlanner from "./pages/AIPlanner";
import AIKnowledgeBase from "./pages/AIKnowledgeBase";
import AIAcademy from "./pages/AIAcademy";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import GoogleDrive from "./pages/GoogleDrive";
import GoogleDocs from "./pages/GoogleDocs";
import TranslationDemo from "./pages/TranslationDemo";
import ContentStyler from "./pages/ContentStyler";
import ContentToneWizardPage from "./pages/ContentToneWizardPage";
import ChatDemo from "./pages/ChatDemo";
import Test3DComponents from "./test-3d-components";
import TestDirectPage from "./pages/test-direct";
import TestMarketplacePage from "./pages/test-marketplace";
import DiagnosticsTest from "./pages/DiagnosticsTest";
import ConversationPage from "./pages/ConversationPage";
import SavedDraftsPage from "./pages/SavedDraftsPage";
import SavedDrafts from "./SavedDrafts"; // Import direct access component
import CreateDraftPage from "./pages/CreateDraftPage";
import EditDraftPage from "./pages/EditDraftPage";
import AgentMarketplace from "./pages/AgentMarketplace";
import AgentDetailPage from "./pages/AgentDetailPage.premium";
import AgentCategoryPage from "./pages/AgentCategoryPage";
import TestSidebarPage from "./pages/TestSidebarPage";
import SecurityTest from "./pages/SecurityTest";
import ApiTest from "./pages/ApiTest";
import TestContentPage from "./pages/TestContentPage";
// Import AITeam component for backward compatibility
import AITeam from "./pages/AITeam";
// Import Google Workspace integration pages
import { GoogleIntegrationsPage } from "./pages/GoogleIntegrationsPage";
import { ImportDocumentPage } from "./pages/ImportDocumentPage";
// Import new conversation management pages
import ConversationsPage from "./pages/ConversationsPage";
import ConversationDetailPage from "./pages/ConversationDetailPage";
import ChatTestPage from "./pages/ChatTestPage"; // Import test page for Firestore
import ChatAdapterDemo from "./pages/ChatAdapterDemo"; // Import demo page for chat adapter
import FirebaseAuthPage from "./pages/FirebaseAuthPage"; // Import Firebase auth page
import { AuthProvider } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import { initializeRouter } from "@/lib/router";
// Import CSRF security components
import CsrfTokenProvider from "@/components/security/CsrfTokenProvider";
import AgentWorkspace from './pages/workspace/[type]/[id]';
import CopywriterWorkspace from './pages/workspace/CopywriterWorkspace';

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Home />
      </Route>
      <Route path="/sign-in">
        <SignIn />
      </Route>
      <Route path="/dashboard">
        <Dashboard />
      </Route>
      <Route path="/dashboard/:subpage">
        <Dashboard />
      </Route>
      
      {/* AI Platform Routes */}
      <Route path="/team" component={AgentMarketplace} />
      <Route path="/team/:category" component={AgentCategoryPage} />
      <Route path="/content-hub" component={ContentHub} />
      <Route path="/content-hub/:section" component={ContentHub} />
      <Route path="/ai-tools" component={AITools} />
      <Route path="/ai-tools/:tool" component={AITools} />
      <Route path="/tools" component={AITools} />
      <Route path="/tools/:tool" component={AITools} />
      <Route path="/workflows" component={AIWorkflows} />
      <Route path="/analyzer" component={AIAnalyzer} />
      <Route path="/analyzer/:section" component={AIAnalyzer} />
      <Route path="/planner" component={AIPlanner} />
      <Route path="/planner/:section" component={AIPlanner} />
      <Route path="/knowledge-base" component={AIKnowledgeBase} />
      <Route path="/knowledge-base/:section" component={AIKnowledgeBase} />
      <Route path="/academy/courses" component={AIAcademy} />
      <Route path="/academy/guides" component={AIAcademy} />
      <Route path="/google-drive" component={GoogleDrive} />
      <Route path="/google-docs" component={GoogleDocs} />
      <Route path="/integrations/google" component={GoogleIntegrationsPage} />
      <Route path="/documents/import" component={ImportDocumentPage} />
      <Route path="/settings" component={Settings} />
      <Route path="/settings/:section" component={Settings} />
      <Route path="/billing" component={Billing} />
      <Route path="/pricing" component={Billing} />
      
      {/* Workflow Routes */}
      <Route path="/workflow/legacy" component={Workflow} />
      <Route path="/workflow/custom" component={LegoWorkflow} />
      <Route path="/workflow/premade" component={LegoWorkflow} />
      <Route path="/workflow/saved" component={LegoWorkflow} />
      <Route path="/workflow/:id" component={LegoWorkflow} />
      <Route path="/workflow" component={LegoWorkflow} />
      <Route path="/enhancedworkflow" component={LegoWorkflow} />
      
      {/* Lego Workflow UI Routes */}
      <Route path="/lego-workflow" component={LegoWorkflow} />
      <Route path="/lego-workflow/:id" component={LegoWorkflow} />
      <Route path="/ai-workflows" component={AIWorkflows} />
      
      {/* Content Creation Tools */}
      <Route path="/content-styler" component={ContentStyler} />
      <Route path="/content-tone-wizard" component={ContentToneWizardPage} />
      <Route path="/tone-wizard" component={ContentToneWizardPage} />
      <Route path="/conversation/:id" component={ConversationPage} />
      
      {/* Conversation Management */}
      <Route path="/conversations" component={ConversationsPage} />
      <Route path="/conversation/:agentType/:id" component={ConversationDetailPage} />
      
      {/* Draft Management */}
      <Route path="/drafts" component={SavedDraftsPage} />
      <Route path="/drafts/new" component={CreateDraftPage} />
      <Route path="/drafts/edit/:id" component={EditDraftPage} />
      
      {/* Agent Marketplace Routes */}
      <Route path="/agent-marketplace" component={AgentMarketplace} />
      <Route path="/agent-marketplace/category/:id" component={AgentCategoryPage} />
      <Route path="/agent-marketplace/:id" component={AgentDetailPage} />
      <Route path="/agents" component={AgentMarketplace} />
      <Route path="/agents/category/:id" component={AgentCategoryPage} />
      <Route path="/agents/:id" component={AgentDetailPage} />
      
      {/* Test Routes */}
      <Route path="/test-3d" component={Test3DComponents} />
      <Route path="/test-direct" component={TestDirectPage} />
      <Route path="/test-marketplace" component={TestMarketplacePage} />
      <Route path="/test-sidebar" component={TestSidebarPage} />
      <Route path="/diagnostics" component={DiagnosticsTest} />
      <Route path="/i18n-demo" component={TranslationDemo} />
      <Route path="/chat-demo" component={ChatDemo} />
      <Route path="/security-test" component={SecurityTest} />
      <Route path="/api-test" component={ApiTest} />
      <Route path="/test-content" component={TestContentPage} />
      <Route path="/chat-test" component={ChatTestPage} />
      <Route path="/chat-adapter-demo" component={ChatAdapterDemo} />
      <Route path="/firebase-auth" component={FirebaseAuthPage} />
      
      <Route path="/workspace/copywriter/:id" component={CopywriterWorkspace} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [, setLocation] = useLocation();

  // Initialize the router utility to allow navigation from outside components
  useEffect(() => {
    initializeRouter(setLocation);
  }, [setLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <CsrfTokenProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </CsrfTokenProvider>
    </QueryClientProvider>
  );
}

export default App;
