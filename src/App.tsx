import React, { useState } from 'react';
import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';
import { TopHeader } from './components/TopHeader';
import { BottomNav, MainTab } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { OrderTab } from './components/OrderTab';
import { DiscoverTab } from './components/DiscoverTab';
import { ProfileTab } from './components/ProfileTab';
import { WizardSetup } from './components/WizardSetup';
import { SettingsModal } from './components/SettingsModal';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { showWizard, setShowWizard, hasCompletedWizard } = useWatchlist();

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    // If the user clicks the Order tab and hasn't yet completed the setup wizard, show the wizard!
    if (tab === 'order' && !hasCompletedWizard) {
      setShowWizard(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 flex flex-col font-sans selection:bg-pink-600 selection:text-white">
      {/* Top Header */}
      <TopHeader
        onOpenWizard={() => setShowWizard(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNavigate={(tab) => handleTabChange(tab)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-4 pb-24">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'order' && (
          <OrderTab onOpenWizard={() => setShowWizard(true)} />
        )}
        {activeTab === 'discover' && <DiscoverTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* Floating Dark Capsule Bottom Navigation Bar: [Progress] [Order] [Discover] [Profile] */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Wizard Setup Flow (Shows when Order tab is clicked or via [Adjust Order]) */}
      {showWizard && (
        <WizardSetup
          onClose={() => setShowWizard(false)}
          isAdjusting={hasCompletedWizard}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WatchlistProvider>
      <MainAppContent />
    </WatchlistProvider>
  );
}
