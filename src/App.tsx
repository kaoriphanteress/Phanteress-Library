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
import { FeedbackInboxModal } from './components/FeedbackInboxModal';
import { AuthModal } from './components/AuthModal';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { showWizard, setShowWizard, hasCompletedWizard } = useWatchlist();

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
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
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
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

      {/* Community Feedback & Suggestions Inbox Modal */}
      <FeedbackInboxModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      {/* Multi-Device Account & Cloud Sync Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Wizard Setup Flow */}
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
