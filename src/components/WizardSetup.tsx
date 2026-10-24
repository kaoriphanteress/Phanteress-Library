import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Film,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  CheckCircle2,
  Calendar,
  Lock,
  X,
  ListOrdered,
  FolderTree,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { OrderConfiguration, PropertyGroup, WatchOrderType, GroupingMode, MarvelTitle } from '../types';
import { PROPERTY_DESCRIPTIONS, ORDER_TYPE_DESCRIPTIONS, MARVEL_CATALOG } from '../data/marvelCatalog';

interface WizardSetupProps {
  onClose?: () => void;
  isAdjusting?: boolean;
}

export const WizardSetup: React.FC<WizardSetupProps> = ({ onClose, isAdjusting = false }) => {
  const { orderConfig, applyOrderConfiguration, setShowWizard, setHasCompletedWizard } = useWatchlist();

  const [step, setStep] = useState<number>(isAdjusting ? 2 : 1);
  const [selectedFranchise, setSelectedFranchise] = useState<'marvel' | 'dc'>('marvel');
  const [selectedProperties, setSelectedProperties] = useState<PropertyGroup>(orderConfig.properties);
  const [selectedOrderType, setSelectedOrderType] = useState<WatchOrderType>(orderConfig.orderType);
  const [selectedGroupingMode, setSelectedGroupingMode] = useState<GroupingMode>(orderConfig.groupingMode || 'phase');

  // Step 6 progressive generation state
  const [generatingTitles, setGeneratingTitles] = useState<MarvelTitle[]>([]);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [isGenerationComplete, setIsGenerationComplete] = useState<boolean>(false);

  // Enforce rule: Only Focus MCU can pick Story Order.
  useEffect(() => {
    if (selectedProperties !== 'mcu' && (selectedOrderType === 'story' || selectedOrderType === 'chronological')) {
      setSelectedOrderType('release');
    }
    if (selectedOrderType === 'phanteress') {
      setSelectedOrderType('release');
    }
  }, [selectedProperties, selectedOrderType]);

  // Target titles for selected configuration
  const targetTitles = React.useMemo(() => {
    if (selectedProperties === 'doomsday') {
      const ddIds = [
        'x-men-2000',
        'x2-x-men-united-2003',
        'captain-america-first-avenger-2011',
        'the-avengers-2012',
        'avengers-infinity-war-2018',
        'avengers-endgame-2019',
        'loki-season-1-2021',
        'loki-season-2-2023',
        'shang-chi-2021',
        'spiderman-no-way-home-2021',
        'black-panther-wakanda-forever-2022',
        'doctor-strange-multiverse-2022',
        'deadpool-and-wolverine-2024',
        'captain-america-brave-new-world-2025',
        'thunderbolts-2025',
        'fantastic-four-first-steps-2025',
      ];
      return ddIds.map((id) => MARVEL_CATALOG.find((t) => t.id === id)).filter((t): t is MarvelTitle => Boolean(t));
    }

    const filtered = MARVEL_CATALOG.filter((t) => {
      if (selectedProperties === 'mcu') return t.inFocusMcu;
      if (selectedProperties === 'all-marvel') return t.inAllMarvel;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (selectedOrderType === 'story' || selectedOrderType === 'chronological') {
        return (a.storyRank ?? a.chronologicalRank ?? a.releaseRank) - (b.storyRank ?? b.chronologicalRank ?? b.releaseRank);
      }
      return a.releaseRank - b.releaseRank;
    });
  }, [selectedProperties, selectedOrderType]);

  // Handle Step 6 generation simulation
  useEffect(() => {
    if (step !== 6) {
      setGeneratingTitles([]);
      setGenerationProgress(0);
      setIsGenerationComplete(false);
      return;
    }

    let currentIdx = 0;
    const total = targetTitles.length;
    setGeneratingTitles([]);
    setIsGenerationComplete(false);

    const interval = setInterval(() => {
      if (currentIdx < total) {
        const nextTitle = targetTitles[currentIdx];
        setGeneratingTitles((prev) => [...prev, nextTitle]);
        currentIdx += 1;
        setGenerationProgress(Math.round((currentIdx / total) * 100));
      } else {
        clearInterval(interval);
        setIsGenerationComplete(true);
        // Apply configuration into context state
        const finalConfig: OrderConfiguration = {
          franchise: selectedFranchise,
          properties: selectedProperties,
          orderType: selectedOrderType,
          groupingMode: selectedProperties === 'doomsday' ? 'list' : selectedGroupingMode,
        };
        applyOrderConfiguration(finalConfig);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [step, targetTitles, selectedFranchise, selectedProperties, selectedOrderType, selectedGroupingMode]);

  // USER RULE: When user selects Doomsday List in Step 3, they have no choice to pick for the next, so it automatically creates the list!
  const handleSelectDoomsday = () => {
    setSelectedProperties('doomsday');
    setSelectedOrderType('release');
    setSelectedGroupingMode('list');
    // Auto-advance straight to generation step!
    setStep(6);
  };

  const handleKeepCurrentOrder = () => {
    setHasCompletedWizard(true);
    setShowWizard(false);
    if (onClose) onClose();
  };

  const handleFinish = () => {
    setHasCompletedWizard(true);
    setShowWizard(false);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Progress & Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center text-white shadow-md">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight">Watchlist Setup</h2>
              <p className="text-[11px] text-slate-400">Step {step} of 6</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'w-6 bg-pink-500'
                      : s < step
                      ? 'w-2.5 bg-pink-800/80'
                      : 'w-2.5 bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleKeepCurrentOrder}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close and keep current order"
              aria-label="Close setup wizard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {/* --- STEP 1: FIRST SCREEN --- */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 text-center py-4"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-pink-950/40 border border-pink-800/40 flex items-center justify-center text-pink-400">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    Do you want to setup your own Watchlist?
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Personalize your Marvel journey with custom properties, canon timelines, grouping styles, and viewing calendars.
                  </p>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3.5 px-6 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm shadow-lg shadow-pink-900/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Yes, Let's Build</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={handleKeepCurrentOrder}
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-medium text-sm transition-all flex items-center justify-center cursor-pointer"
                  >
                    No, Keep My Current Order
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- STEP 2: WHAT FRANCHISE WOULD YOU LIKE TO WATCH? --- */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-xs font-semibold text-pink-400 tracking-wider uppercase">Universe Selection</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                    WHAT FRANCHISE WOULD YOU LIKE TO WATCH?
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div
                    onClick={() => setSelectedFranchise('marvel')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                      selectedFranchise === 'marvel'
                        ? 'bg-pink-950/20 border-pink-500 shadow-md shadow-pink-950/40'
                        : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white tracking-wide">Marvel</span>
                          <span className="text-[11px] font-semibold bg-pink-600 text-white px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          The epic cinematic multiverse spanning 17+ years of gods, monsters, heroes, and cosmic battles—from Iron Man to the Road to Doomsday.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        selectedFranchise === 'marvel' ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-600'
                      }`}>
                        {selectedFranchise === 'marvel' && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 opacity-70 cursor-not-allowed text-left relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-slate-400">DC</span>
                          <span className="text-[10px] bg-slate-800 text-pink-400 border border-pink-900/40 px-2 py-0.5 rounded flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Coming Soon
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          From Gotham's shadows to Metropolis and the upcoming DCU slate. Expanding in future updates!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="py-2.5 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Continue to Properties <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- STEP 3: PICK A PROPERTIES --- */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-semibold text-pink-400 tracking-wider uppercase">Catalog Scope</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                    PICK A PROPERTIES:
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select how extensive you want your Marvel library to be.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* [Doomsday List] - USER RULE: Auto creates list immediately! */}
                  <div
                    onClick={handleSelectDoomsday}
                    className="p-4 sm:p-5 rounded-2xl border border-pink-500/80 bg-gradient-to-r from-pink-950/40 to-slate-900 hover:border-pink-400 transition-all cursor-pointer text-left group shadow-lg shadow-pink-950/30"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white group-hover:text-pink-300 transition-colors">
                            Doomsday List
                          </span>
                          <span className="text-[10px] font-extrabold bg-pink-600 text-white px-2 py-0.5 rounded shadow">
                            Instant Auto-Create ✨
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-200">
                          Curated 15 Essential Multiverse &amp; MCU Masterworks
                        </p>
                        <p className="text-[11px] text-slate-400">
                          X-Men, X2, The First Avenger, The Avengers, Infinity War, Endgame, Loki S1–S2, Shang-Chi, No Way Home, Wakanda Forever, Multiverse of Madness, Deadpool &amp; Wolverine, Brave New World, Thunderbolts*, and First Steps.
                        </p>
                        <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tap here to immediately auto-generate this curated list!
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-md group-hover:scale-105 transition-transform">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* [Focus MCU] */}
                  <div
                    onClick={() => setSelectedProperties('mcu')}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                      selectedProperties === 'mcu'
                        ? 'bg-blue-950/20 border-blue-500 shadow-md shadow-blue-950/40'
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">Focus MCU</span>
                          <span className="text-[10px] font-semibold bg-blue-950/80 text-blue-400 border border-blue-800/80 px-2 py-0.5 rounded">
                            Sacred Timeline Canon
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-300">
                          {PROPERTY_DESCRIPTIONS.mcu.tagline}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Complete mainline Marvel Cinematic Universe canon movies, Disney+ series &amp; specials, Brand New Day, VisionQuest, and Phase 6 releases.
                        </p>
                        <p className="text-[11px] font-semibold text-blue-400">
                          Total: 118 MCU Canon Titles (Enables Story Order!)
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        selectedProperties === 'mcu' ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-600'
                      }`}>
                        {selectedProperties === 'mcu' && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* [All Marvel Properties] */}
                  <div
                    onClick={() => setSelectedProperties('all-marvel')}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                      selectedProperties === 'all-marvel'
                        ? 'bg-purple-950/20 border-purple-500 shadow-md shadow-purple-950/40'
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">All Marvel Properties</span>
                          <span className="text-[10px] font-semibold bg-purple-950/80 text-purple-400 border border-purple-800/80 px-2 py-0.5 rounded">
                            Complete Marvel History
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-300">
                          {PROPERTY_DESCRIPTIONS['all-marvel'].tagline}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Every Marvel screen production from 1944 Captain America serial, 60s–90s animation, live-action classics, Fox/Sony multiverses, to modern MCU.
                        </p>
                        <p className="text-[11px] font-semibold text-purple-400">
                          Total: 286 Master Properties
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        selectedProperties === 'all-marvel' ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-600'
                      }`}>
                        {selectedProperties === 'all-marvel' && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="py-2.5 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Continue to Order <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- STEP 4: CHOOSE YOUR WATCH ORDER (STORY ORDER RENAMED) --- */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-semibold text-pink-400 tracking-wider uppercase">Viewing Sequence</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                    CHOOSE YOUR WATCH ORDER:
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    How do you want your viewing roadmap sequenced?
                  </p>
                </div>

                <div className="space-y-3">
                  {/* [Release Order] */}
                  <div
                    onClick={() => setSelectedOrderType('release')}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                      selectedOrderType === 'release'
                        ? 'bg-pink-950/20 border-pink-500 shadow-md shadow-pink-950/40'
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-white">Release Order</span>
                          <span className="text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded">
                            {ORDER_TYPE_DESCRIPTIONS.release.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ORDER_TYPE_DESCRIPTIONS.release.description}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        selectedOrderType === 'release' ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-600'
                      }`}>
                        {selectedOrderType === 'release' && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* [Story Order] - ONLY SELECTABLE FOR FOCUS MCU */}
                  {selectedProperties === 'mcu' ? (
                    <div
                      onClick={() => setSelectedOrderType('story')}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                        selectedOrderType === 'story' || selectedOrderType === 'chronological'
                          ? 'bg-pink-950/20 border-pink-500 shadow-md shadow-pink-950/40'
                          : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-white">Story Order</span>
                            <span className="text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded">
                              In-Universe Timeline!
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Follow the narrative in-universe timeline from 1940s WWII Captain America, through the Sacred Timeline, into the Quantum and Multiversal future.
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                          selectedOrderType === 'story' || selectedOrderType === 'chronological' ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-600'
                        }`}>
                          {(selectedOrderType === 'story' || selectedOrderType === 'chronological') && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-5 rounded-2xl border border-slate-800/60 bg-slate-950/50 opacity-60 cursor-not-allowed text-left">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-slate-400">Story Order</span>
                            <span className="text-[10px] font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-pink-400" /> Focus MCU Exclusive
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Story Order (in-universe narrative timeline) is exclusively available for Focus MCU. For All Marvel Properties, please select Release Order.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* [Phanteress Order] - LOCKED / UNDER CURATION */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-purple-900/40 bg-purple-950/20 opacity-60 cursor-not-allowed text-left relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-300">Phanteress Order</span>
                          <span className="text-[10px] font-semibold bg-purple-950 text-purple-400 border border-purple-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Coming Soon · Under Curation
                          </span>
                        </div>
                        <p className="text-xs text-purple-300/80 leading-relaxed">
                          Phanteress's custom narrative watch sequence is currently being curated and assembled. It will unlock automatically once the curated order is submitted!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep(3)}
                    className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="py-2.5 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Continue to Grouping <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- STEP 5: [BY PHASE] VS [ONE LONG LIST] --- */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div>
                  <span className="text-xs font-semibold text-pink-400 tracking-wider uppercase">List Layout &amp; Organization</span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                    HOW WOULD YOU LIKE YOUR LIST DISPLAYED?
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose whether to categorize your watchlist into phases or view it as an unbroken marathon.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div
                    onClick={() => setSelectedGroupingMode('phase')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                      selectedGroupingMode === 'phase'
                        ? 'bg-pink-950/20 border-pink-500 shadow-md shadow-pink-950/40 ring-1 ring-pink-500/40'
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 pr-3">
                        <div className="flex items-center gap-2">
                          <FolderTree className="w-4 h-4 text-pink-400" />
                          <span className="text-base font-bold text-white tracking-wide">[BY PHASE]</span>
                          <span className="text-[10px] font-semibold bg-pink-950 text-pink-300 border border-pink-800/70 px-2 py-0.5 rounded">
                            Structured
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-200">
                          Generate a list organized by Marvel Phases.
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Divides your watchlist into distinct chapters (Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Multiverse, and Upcoming) with phase header cards and progress counters.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        selectedGroupingMode === 'phase' ? 'border-pink-500 bg-pink-500 text-white' : 'border-slate-600'
                      }`}>
                        {selectedGroupingMode === 'phase' && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedGroupingMode('list')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                      selectedGroupingMode === 'list'
                        ? 'bg-purple-950/25 border-purple-500 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/40'
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5 pr-3">
                        <div className="flex items-center gap-2">
                          <ListOrdered className="w-4 h-4 text-purple-400" />
                          <span className="text-base font-bold text-white tracking-wide">[ONE LONG LIST]</span>
                          <span className="text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800/70 px-2 py-0.5 rounded">
                            Continuous Stream
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-200">
                          Just the list without phasing.
                        </p>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Presents your entire watchlist as a single seamless numbered marathon from title 1 to the end, without phase divider banners.
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                        selectedGroupingMode === 'list' ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-600'
                      }`}>
                        {selectedGroupingMode === 'list' && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep(4)}
                    className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={() => setStep(6)}
                    className="py-2.5 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    Generate My Order <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- STEP 6: ORDER GENERATING & PROGRESSIVE TITLE ADDITION --- */}
            {step === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {isGenerationComplete && (
                  <div className="p-3.5 bg-pink-950/40 border border-pink-800/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-200">
                        All {targetTitles.length} titles generated in your order ({selectedProperties === 'doomsday' ? 'Road to Doomsday' : selectedGroupingMode === 'phase' ? 'Grouped by Phase' : 'One Long List'})!
                      </span>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
                      <span>Adjust Your Order</span>
                    </button>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-pink-400 tracking-wider uppercase">
                        {isGenerationComplete ? 'Generation Complete' : 'Generating Watchlist...'}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                        {isGenerationComplete ? 'Your Personalized Watchlist is Ready' : 'Sequencing Titles One by One'}
                      </h3>
                    </div>
                    <span className="text-sm font-mono font-bold text-pink-400 tabular-nums">
                      {generationProgress}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${generationProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.2 }}
                    />
                  </div>
                </div>

                {/* Animated Stream of Titles Added */}
                <div className="border border-slate-800 rounded-2xl bg-slate-950/60 p-3 max-h-64 overflow-y-auto space-y-2">
                  {generatingTitles.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {item.year} · {item.type === 'series' ? `${item.episodesCount} episodes` : `${item.runtimeMinutes}m`} · {item.heroCharacter}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-amber-400">
                          IMDb {item.imdbRating}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </motion.div>
                  ))}

                  {!isGenerationComplete && (
                    <div className="py-2 text-center text-xs text-slate-500 animate-pulse flex items-center justify-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                      <span>Syncing metadata &amp; sequence order...</span>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Watch Schedule automatically primed in your Calendar.</span>
                  </div>

                  <button
                    onClick={handleFinish}
                    disabled={!isGenerationComplete}
                    className={`w-full sm:w-auto py-3 px-6 rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isGenerationComplete
                        ? 'bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-500 hover:to-purple-600 text-white shadow-pink-900/40'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Start Watching</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
