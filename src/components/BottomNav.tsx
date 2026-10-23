import React from 'react';
import { CheckCircle2, ListOrdered, Search, Compass, User } from 'lucide-react';

export type MainTab = 'home' | 'order' | 'discover' | 'profile';

interface BottomNavProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'home' as MainTab,
      label: 'Progress',
      icon: CheckCircle2,
    },
    {
      id: 'order' as MainTab,
      label: 'Order',
      icon: ListOrdered,
    },
    {
      id: 'discover' as MainTab,
      label: 'Discover',
      icon: Search,
    },
    {
      id: 'profile' as MainTab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none"
    >
      <div className="max-w-md mx-auto px-4 pb-3 pt-1 pointer-events-auto">
        <div className="bg-[#121318]/95 backdrop-blur-2xl border border-slate-800/80 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.8)] grid grid-cols-4 items-center p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'bg-slate-800/90 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'scale-110 text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)]'
                      : 'group-hover:scale-105'
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold tracking-tight mt-0.5 transition-colors ${
                    isActive ? 'text-white font-bold' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
