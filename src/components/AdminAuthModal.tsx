import React, { useState } from 'react';
import { X, Lock, KeyRound, Check, AlertCircle, Eye, EyeOff, ShieldCheck, Inbox, ArrowRight } from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPasscode: string;
  onUpdatePasscode: (newPasscode: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onOpenInbox?: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPasscode,
  onUpdatePasscode,
  isLoggedIn,
  onLogout,
  onOpenInbox,
}) => {
  const [passcodeInput, setPasscodeInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  // Passcode change states
  const [isChangingPasscode, setIsChangingPasscode] = useState(true); // default to showing change passcode form when in admin view
  const [oldPasscode, setOldPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === currentPasscode.trim()) {
      setErrorMsg('');
      setPasscodeInput('');
      setJustUnlocked(true);
      onSuccess();
      // Keep modal open so the user sees the unlocked status and Change Passcode option!
    } else {
      setErrorMsg('Incorrect passcode. Please try again.');
    }
  };

  const handleChangePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPasscode.trim() !== currentPasscode.trim()) {
      setErrorMsg('Current passcode does not match.');
      return;
    }
    if (newPasscode.trim().length < 4) {
      setErrorMsg('New passcode must be at least 4 characters long.');
      return;
    }
    if (newPasscode.trim() !== confirmPasscode.trim()) {
      setErrorMsg('New passcode and confirm passcode do not match.');
      return;
    }

    onUpdatePasscode(newPasscode.trim());
    setChangeSuccess(true);
    setErrorMsg('');
    setOldPasscode('');
    setNewPasscode('');
    setConfirmPasscode('');
    setTimeout(() => {
      setChangeSuccess(false);
    }, 4000);
  };

  const isAuthActive = isLoggedIn || justUnlocked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              isAuthActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            }`}>
              {isAuthActive ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white font-heading">
                {isAuthActive ? 'Admin Security & Passcode' : 'Admin Passcode Required'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isAuthActive
                  ? 'Authenticated as Rishu Mishra (Blog Owner)'
                  : 'Enter passcode to access private messages & settings'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* STATE 1: Authenticated (Shows status, Change Passcode form, and action buttons) */}
          {isAuthActive ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Unlocked banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    Admin Session Active
                  </span>
                </div>
                {onOpenInbox && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInbox();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Go to Inbox</span>
                  </button>
                )}
              </div>

              {/* CHANGE PASSCODE FORM */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                      Change Admin Passcode
                    </h4>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Current: ••••••••
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {changeSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">Passcode updated successfully! Remember your new passcode.</span>
                  </div>
                )}

                <form onSubmit={handleChangePasscodeSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Current Passcode *
                    </label>
                    <input
                      type="password"
                      required
                      value={oldPasscode}
                      onChange={(e) => {
                        setOldPasscode(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Enter current passcode"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        New Passcode *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        {showNewPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPasscode}
                      onChange={(e) => {
                        setNewPasscode(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="New passcode (min 4 characters)"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Confirm New Passcode *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPasscode}
                      onChange={(e) => {
                        setConfirmPasscode(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Re-type new passcode"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Save New Passcode</span>
                  </button>
                </form>
              </div>

              {/* Action buttons at bottom */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                {onOpenInbox && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInbox();
                    }}
                    className="w-full sm:flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Open Messages Inbox</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setJustUnlocked(false);
                    onClose();
                  }}
                  className="w-full sm:w-auto py-2.5 px-4 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Admin</span>
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  Close & continue browsing
                </button>
              </div>
            </div>
          ) : (
            /* STATE 2: Login / Enter Passcode Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Enter Admin Passcode
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  Messages submitted by visitors are private and accessible only by you.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-in fade-in duration-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Passcode
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    value={passcodeInput}
                    onChange={(e) => {
                      setPasscodeInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Enter passcode (Default: rishu2026)"
                    className="w-full pl-3 pr-10 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5">
                  Default passcode: <span className="font-mono font-semibold text-indigo-500">rishu2026</span>
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Unlock Admin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
