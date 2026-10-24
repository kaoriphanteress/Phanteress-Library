import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    account,
    signIn,
    createAccount,
    signOut,
    syncWithCloud,
    exportSyncCode,
    importSyncCode,
    profile,
  } = useWatchlist();

  const [mode, setMode] = useState<'signin' | 'signup' | 'synccode'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'signup') {
      const res = await createAccount({
        email: email.trim(),
        pass: password,
        displayName: displayName.trim() || 'Hero',
        username: (displayName.trim() || 'hero').toLowerCase().replace(/[^a-z0-9_]/g, ''),
      });
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to create account.');
      } else {
        setSuccessMsg('Account created and watch progress synced!');
        setTimeout(() => onClose(), 1500);
      }
    } else if (mode === 'signin') {
      const res = await signIn(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to sign in.');
      } else {
        setSuccessMsg('Signed in successfully! Your watch progress has been synced from cloud.');
        setTimeout(() => onClose(), 1500);
      }
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncWithCloud();
    setTimeout(() => {
      setIsSyncing(false);
      setSuccessMsg('Cloud sync complete!');
      setTimeout(() => setSuccessMsg(''), 2500);
    }, 600);
  };

  const handleCopyCode = () => {
    const code = exportSyncCode();
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleImportCode = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!syncCodeInput.trim()) {
      setErrorMsg('Please paste a sync code.');
      return;
    }
    const ok = importSyncCode(syncCodeInput.trim());
    if (ok) {
      setSuccessMsg('Watch data successfully imported and synced to this device!');
      setTimeout(() => onClose(), 1800);
    } else {
      setErrorMsg('Invalid or expired sync code. Please verify and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-950/80 border border-pink-700/60 flex items-center justify-center text-pink-400">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {account ? 'Cloud Account & Sync' : 'Multi-Device Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Access your watchlist and watch progress across all devices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* ALREADY LOGGED IN VIEW */}
          {account ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/30 to-slate-950 border border-pink-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-white">Connected &amp; Synced</span>
                  </div>
                  <span className="text-[10px] font-mono bg-pink-950/80 text-pink-300 border border-pink-800/60 px-2 py-0.5 rounded">
                    {account.syncKey}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-slate-300">
                    Logged in as <strong className="text-white">{account.email}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Last Cloud Sync: {new Date(account.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex-1 py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-950/40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync with Cloud Now</span>
                  </button>

                  <button
                    onClick={signOut}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              {/* Instant Device Sync Code (Direct Migration) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                    Direct Device Migration Code
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Open this app on your other phone or computer, click "Import Sync Code" below, and paste this code to transfer all watch data instantly without passwords!
                </p>
              </div>
            </div>
          ) : (
            /* NOT LOGGED IN: TABS FOR SIGN IN / CREATE ACCOUNT / SYNC CODE */
            <div className="space-y-4">
              {/* Tab Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    mode === 'signin' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    mode === 'signup' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => setMode('synccode')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    mode === 'synccode' ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sync Code
                </button>
              </div>

              {/* Form: Email & Password for Login or Register */}
              {mode !== 'synccode' ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Display Name / Super Hero Alias
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Pantheress"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@marveluniverse.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-950/40 cursor-pointer mt-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{mode === 'signup' ? 'Create Account & Sync' : 'Sign In & Restore Progress'}</span>
                  </button>
                </form>
              ) : (
                /* SYNC CODE IMPORT / EXPORT */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                      Paste Code from Another Device
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      If you have this app open on another device, copy your code there and paste it below to sync everything in one tap.
                    </p>
                    <textarea
                      value={syncCodeInput}
                      onChange={(e) => setSyncCodeInput(e.target.value)}
                      placeholder="Paste your device sync code here..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-pink-500 resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleImportCode}
                      className="w-full py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                    >
                      Import &amp; Sync This Device
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Want to export this device's data?</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-xs font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied!' : 'Copy My Code'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
