import React from 'react';
import { GraphProvider, useGraph } from './context/GraphContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import GraphLabPage from './pages/GraphLabPage';
import ColoringLabPage from './pages/ColoringLabPage';
import PlanarityLabPage from './pages/PlanarityLabPage';
import ExperimentsPage from './pages/ExperimentsPage';
import ChallengesPage from './pages/ChallengesPage';

function AppContent() {
  const { activeTab } = useGraph();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'learn' && <LearnPage />}
        {activeTab === 'graph-lab' && <GraphLabPage />}
        {activeTab === 'coloring-lab' && <ColoringLabPage />}
        {activeTab === 'planarity-lab' && <PlanarityLabPage />}
        {activeTab === 'experiments' && <ExperimentsPage />}
        {activeTab === 'challenges' && <ChallengesPage />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <GraphProvider>
      <AppContent />
    </GraphProvider>
  );
}
