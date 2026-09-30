import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowEditorPage from './pages/WorkflowEditorPage';
import ExecutionsPage from './pages/ExecutionsPage';
import CredentialsPage from './pages/CredentialsPage';
import SettingsPage from './pages/SettingsPage';
import PromptGeneratorModal from './components/canvas/PromptGeneratorModal';
import AuthPortal from './pages/AuthPortal';

function MainApp() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [activeWorkflowId, setActiveWorkflowId] = useState(null);
  const [generatedWorkflowData, setGeneratedWorkflowData] = useState(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-dark-bg text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
          <span>Initializing Smart Automation Platform...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPortal />;
  }

  const handleOpenEditor = (id, initialData = null) => {
    setActiveWorkflowId(id);
    setGeneratedWorkflowData(initialData);
    setActivePage('editor');
  };

  const handleAiGenerated = (data) => {
    handleOpenEditor('new', data);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col font-sans">
      <Navbar
        onNewWorkflow={() => setIsPromptModalOpen(true)}
        onOpenSettings={() => setActivePage('settings')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Only show sidebar if not inside canvas editor to give canvas full screen real estate */}
        {activePage !== 'editor' && (
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
        )}

        <main className={`flex-1 overflow-y-auto ${activePage === 'editor' ? 'p-5' : 'p-6 max-w-7xl mx-auto w-full'}`}>
          {activePage === 'dashboard' && (
            <DashboardPage
              onNewPromptWorkflow={() => setIsPromptModalOpen(true)}
              onNavigate={(page, id) => {
                if (page === 'workflows' && id === 'new') {
                  handleOpenEditor('new');
                } else {
                  setActivePage(page);
                }
              }}
            />
          )}

          {activePage === 'workflows' && (
            <WorkflowsPage
              onOpenEditor={(id) => handleOpenEditor(id)}
              onNewPromptWorkflow={() => setIsPromptModalOpen(true)}
            />
          )}

          {activePage === 'editor' && (
            <WorkflowEditorPage
              workflowId={activeWorkflowId}
              initialData={generatedWorkflowData}
              onBack={() => setActivePage('workflows')}
            />
          )}

          {activePage === 'executions' && <ExecutionsPage />}

          {activePage === 'credentials' && <CredentialsPage />}

          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      <PromptGeneratorModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onGenerated={handleAiGenerated}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
