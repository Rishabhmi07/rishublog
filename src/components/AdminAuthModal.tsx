import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  KeyRound,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Inbox,
  ArrowRight,
  LogOut,
  PenSquare,
  Tags,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Cpu,
  Globe,
  Terminal,
  Layers,
  Code,
  FolderGit2,
  Sparkles,
  BookOpen,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, signOut, ADMIN_EMAIL } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { CategoryItem, Article } from '../types/blog';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token?: string, username?: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  onOpenInbox?: () => void;
  onOpenNewArticle?: () => void;
  currentUser?: FirebaseUser | null;
  adminUsername?: string;
  adminToken?: string | null;
  categories?: CategoryItem[];
  articles?: Article[];
  onAddCategory?: (category: CategoryItem) => Promise<void>;
  onRenameCategory?: (categoryId: string, oldName: string, updatedCategory: CategoryItem) => Promise<void>;
  onDeleteCategory?: (categoryId: string, oldName: string, replacementName: string) => Promise<void>;
}

const AVAILABLE_ICONS = [
  { name: 'Cpu', label: 'CPU / Hardware', icon: Cpu },
  { name: 'Globe', label: 'Globe / Web', icon: Globe },
  { name: 'Terminal', label: 'Terminal / OS', icon: Terminal },
  { name: 'Layers', label: 'Layers / Systems', icon: Layers },
  { name: 'Code', label: 'Code / Dev', icon: Code },
  { name: 'FolderGit2', label: 'Folder / Projects', icon: FolderGit2 },
  { name: 'Sparkles', label: 'Sparkles / AI', icon: Sparkles },
  { name: 'BookOpen', label: 'Book / Notes', icon: BookOpen },
];

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isLoggedIn,
  onLogout,
  onOpenInbox,
  onOpenNewArticle,
  currentUser,
  adminUsername = 'rishu',
  adminToken,
  categories = [],
  articles = [],
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}) => {
  // Navigation tab inside admin panel
  const [adminActiveTab, setAdminActiveTab] = useState<'credentials' | 'categories'>('credentials');

  const [authMethod, setAuthMethod] = useState<'google' | 'credentials'>('google');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Change credentials states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changeSuccessMsg, setChangeSuccessMsg] = useState('');

  // Category Manager States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Code');
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryFeedback, setCategoryFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Category Edit / Rename State
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editIcon, setEditIcon] = useState('Code');

  // Category Deletion Safety Dialog State
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [replacementCategoryId, setReplacementCategoryId] = useState('');

  if (!isOpen) return null;

  // Render Icon helper
  const renderCategoryIcon = (iconName?: string) => {
    const found = AVAILABLE_ICONS.find((i) => i.name === iconName);
    const IconComponent = found ? found.icon : Code;
    return <IconComponent className="w-4 h-4" />;
  };

  // Handle Username + Password Login via Backend API
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsernameInput('');
        setPasswordInput('');
        onSuccess(data.token, data.username);
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Please verify username and password.');
      }
    } catch {
      // Local fallback for offline/preview
      if (
        (usernameInput.trim().toLowerCase() === 'rishu' ||
          usernameInput.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) &&
        (passwordInput.trim() === 'Password@123' || passwordInput.trim() === 'rishu2026')
      ) {
        onSuccess('local_token', 'rishu');
      } else {
        setErrorMsg('Invalid Admin credentials. Default: username: rishu | password: Password@123');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user?.email || '';

      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        onSuccess(undefined, 'Rishu Mishra');
      } else {
        await signOut(auth);
        setErrorMsg(
          `Access Denied: Logged in as ${email}. Only the blog owner (${ADMIN_EMAIL}) has admin permissions.`
        );
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Google Sign-in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Change Credentials
  const handleChangeCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setChangeSuccessMsg('');

    if (newPassword && newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      else headers['x-admin-password'] = currentPassword;

      const res = await fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newUsername: newUsername.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setChangeSuccessMsg('Admin credentials updated successfully!');
        if (data.username) {
          onSuccess(undefined, data.username);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setChangeSuccessMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to update credentials. Please check your current password.');
      }
    } catch {
      setErrorMsg('Error contacting server to update credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CATEGORY ACTIONS
  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFeedback(null);

    const name = newCategoryName.trim();
    if (!name) {
      setCategoryFeedback({ type: 'error', message: 'Category name is required.' });
      return;
    }

    // Check duplicate
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setCategoryFeedback({ type: 'error', message: `Category "${name}" already exists.` });
      return;
    }

    setCategorySubmitting(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCat: CategoryItem = {
      id: slug || `cat-${Date.now()}`,
      name,
      slug: slug || `cat-${Date.now()}`,
      description: newCategoryDesc.trim() || `${name} articles and builds.`,
      iconName: newCategoryIcon,
      articleCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      if (onAddCategory) {
        await onAddCategory(newCat);
      }
      setCategoryFeedback({ type: 'success', message: `Category "${name}" created successfully!` });
      setNewCategoryName('');
      setNewCategoryDesc('');
      setNewCategoryIcon('Code');
      setIsAddingCategory(false);
      setTimeout(() => setCategoryFeedback(null), 3500);
    } catch (err: any) {
      setCategoryFeedback({ type: 'error', message: err?.message || 'Failed to create category.' });
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleStartEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
    setEditIcon(cat.iconName || 'Code');
    setCategoryFeedback(null);
  };

  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setCategoryFeedback({ type: 'error', message: 'Category name cannot be empty.' });
      return;
    }

    setCategorySubmitting(true);
    const updated: CategoryItem = {
      ...editingCategory,
      name: trimmedName,
      description: editDesc.trim(),
      iconName: editIcon,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (onRenameCategory) {
        await onRenameCategory(editingCategory.id, editingCategory.name, updated);
      }
      setCategoryFeedback({
        type: 'success',
        message: `Category "${trimmedName}" updated and matching articles refreshed!`,
      });
      setEditingCategory(null);
      setTimeout(() => setCategoryFeedback(null), 3500);
    } catch (err: any) {
      setCategoryFeedback({ type: 'error', message: err?.message || 'Failed to update category.' });
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleStartDeleteCategory = (cat: CategoryItem) => {
    const count = articles.filter((a) => a.category === cat.name).length;
    setDeletingCategory({ ...cat, articleCount: count });
    // Pick first available replacement that is not this category
    const otherCats = categories.filter((c) => c.name !== cat.name);
    setReplacementCategoryId(otherCats[0]?.name || '');
    setCategoryFeedback(null);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    const count = articles.filter((a) => a.category === deletingCategory.name).length;
    if (count > 0 && !replacementCategoryId) {
      setCategoryFeedback({
        type: 'error',
        message: 'Please choose a replacement category to safely reassign articles.',
      });
      return;
    }

    setCategorySubmitting(true);
    try {
      if (onDeleteCategory) {
        await onDeleteCategory(deletingCategory.id, deletingCategory.name, replacementCategoryId);
      }
      setCategoryFeedback({
        type: 'success',
        message: `Category "${deletingCategory.name}" removed successfully.`,
      });
      setDeletingCategory(null);
      setTimeout(() => setCategoryFeedback(null), 3500);
    } catch (err: any) {
      setCategoryFeedback({ type: 'error', message: err?.message || 'Failed to delete category.' });
    } finally {
      setCategorySubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white font-heading">
                {isLoggedIn ? 'Admin Management Dashboard' : 'Admin Portal Login'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isLoggedIn
                  ? `Logged in as Owner (${ADMIN_EMAIL})`
                  : 'Authorized blog owner access for articles & categories'}
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

        {/* Tab switcher when logged in */}
        {isLoggedIn && (
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-50/50 dark:bg-zinc-900/50">
            <button
              type="button"
              onClick={() => {
                setAdminActiveTab('credentials');
                setCategoryFeedback(null);
              }}
              className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                adminActiveTab === 'credentials'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Overview & Credentials</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminActiveTab('categories');
                setErrorMsg('');
              }}
              className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                adminActiveTab === 'categories'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>Category Management</span>
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono">
                {categories.length}
              </span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: LOGGED IN - CREDENTIALS & SECURITY */}
          {isLoggedIn && adminActiveTab === 'credentials' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Active Admin Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Admin Access Active & Verified
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                    Owner
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Rishu'}
                      className="w-10 h-10 rounded-full object-cover border border-emerald-300 dark:border-emerald-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      RM
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                      Rishu Mishra
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                      Username: {adminUsername} · {ADMIN_EMAIL}
                    </p>
                  </div>
                </div>

                {!currentUser && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 space-y-2">
                    <p className="font-semibold text-[11px] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Cloud Firestore Direct Sync</span>
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                      Connect your Google account ({ADMIN_EMAIL}) so new articles and categories immediately sync directly to Google Cloud Firestore.
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                      className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>Connect Google Account ({ADMIN_EMAIL})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {onOpenNewArticle && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNewArticle();
                    }}
                    className="py-2.5 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <PenSquare className="w-3.5 h-3.5" />
                    <span>Write Article</span>
                  </button>
                )}
                {onOpenInbox && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenInbox();
                    }}
                    className="py-2.5 px-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Inbox className="w-3.5 h-3.5 text-indigo-500" />
                    <span>View Inbox</span>
                  </button>
                )}
              </div>

              {/* CHANGE CREDENTIALS FORM */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                      Change Admin Credentials
                    </h4>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {changeSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{changeSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleChangeCredentialsSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        New Username (optional)
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        New Password (optional)
                      </label>
                      <div className="relative">
                        <input
                          type={showChangePassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full pl-3 pr-8 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowChangePassword(!showChangePassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                          {showChangePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {newPassword && (
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        required={Boolean(newPassword)}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isSubmitting ? 'Saving...' : 'Update Credentials'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Logout Button */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={onLogout}
                  className="py-2 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock & Logout Admin Session</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LOGGED IN - CATEGORY MANAGEMENT */}
          {isLoggedIn && adminActiveTab === 'categories' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Category Management Banner & Add Trigger */}
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-heading">
                    Blog Taxonomy & Topics ({categories.length})
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Categories are stored in Google Cloud Firestore and sync live to all readers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(!isAddingCategory);
                    setEditingCategory(null);
                    setDeletingCategory(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingCategory ? 'Close' : 'Add Category'}</span>
                </button>
              </div>

              {/* Feedback Alert */}
              {categoryFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
                    categoryFeedback.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {categoryFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{categoryFeedback.message}</span>
                </div>
              )}

              {/* ADD CATEGORY FORM */}
              {isAddingCategory && (
                <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-indigo-600" />
                      <span>Create New Category</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCategorySubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="e.g. Distributed Systems"
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Icon
                        </label>
                        <select
                          value={newCategoryIcon}
                          onChange={(e) => setNewCategoryIcon(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                        >
                          {AVAILABLE_ICONS.map((ic) => (
                            <option key={ic.name} value={ic.name}>
                              {ic.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={newCategoryDesc}
                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                        placeholder="e.g. Consensus protocols, Raft, microservices, and fault tolerance."
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="py-1.5 px-3 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={categorySubmitting}
                        className="py-1.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {categorySubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Save to Firestore</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* RENAME / EDIT MODAL INLINE */}
              {editingCategory && (
                <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Pencil className="w-4 h-4 text-amber-600" />
                      <span>Rename Category: {editingCategory.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-800 dark:text-amber-300">
                    ℹ️ Renaming will also automatically update all existing articles currently filed under &ldquo;{editingCategory.name}&rdquo;.
                  </p>

                  <form onSubmit={handleSaveEditCategory} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                          Icon
                        </label>
                        <select
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                        >
                          {AVAILABLE_ICONS.map((ic) => (
                            <option key={ic.name} value={ic.name}>
                              {ic.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="py-1.5 px-3 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={categorySubmitting}
                        className="py-1.5 px-4 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {categorySubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Save & Rename Articles</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* SAFE DELETE DIALOG */}
              {deletingCategory && (
                <div className="p-4 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Confirm Deletion: {deletingCategory.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(null)}
                      className="text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {(() => {
                    const count = articles.filter((a) => a.category === deletingCategory.name).length;
                    const otherCats = categories.filter((c) => c.name !== deletingCategory.name);

                    if (count > 0) {
                      return (
                        <div className="space-y-3">
                          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                            ⚠️ This category is currently assigned to <strong className="font-mono">{count}</strong> article(s). To prevent broken routes or orphaned articles, please choose a replacement category before deleting:
                          </p>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Replacement Category *
                            </label>
                            <select
                              value={replacementCategoryId}
                              onChange={(e) => setReplacementCategoryId(e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                            >
                              {otherCats.map((oc) => (
                                <option key={oc.id} value={oc.name}>
                                  {oc.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <p className="text-xs text-rose-700 dark:text-rose-300">
                        This category has 0 assigned articles. Are you sure you want to permanently delete &ldquo;{deletingCategory.name}&rdquo;?
                      </p>
                    );
                  })()}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(null)}
                      className="py-1.5 px-3 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteCategory}
                      disabled={categorySubmitting}
                      className="py-1.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {categorySubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Confirm Safe Delete</span>
                    </button>
                  </div>
                </div>
              )}

              {/* LIST OF CATEGORIES */}
              <div className="space-y-2.5">
                {categories.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
                    No categories found. Click &ldquo;Add Category&rdquo; above to create one.
                  </div>
                ) : (
                  categories.map((cat) => {
                    const count = articles.filter((a) => a.category === cat.name).length;
                    return (
                      <div
                        key={cat.id}
                        className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shrink-0">
                            {renderCategoryIcon(cat.iconName)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                                {cat.name}
                              </h5>
                              <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[10px] shrink-0">
                                {count} {count === 1 ? 'article' : 'articles'}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditCategory(cat)}
                            title="Rename or edit category"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartDeleteCategory(cat)}
                            title="Delete category"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STATE 2: NOT LOGGED IN AS ADMIN (LOGIN FORM) */}
          {!isLoggedIn && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Method Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('google');
                    setErrorMsg('');
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMethod === 'google'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Google Sign-In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('credentials');
                    setErrorMsg('');
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMethod === 'credentials'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Username & Password
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {authMethod === 'credentials' ? (
                /* Method A: Username + Password */
                <form onSubmit={handleCredentialsLogin} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Admin Username or Email *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="rishu or mishra939rishu@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Admin Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter admin password"
                        className="w-full pl-9 pr-9 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Verifying...' : 'Log In to Admin Panel'}
                  </button>

                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Default Credentials:</span>
                    <div className="font-mono mt-0.5">
                      Username: <code className="text-indigo-600 dark:text-indigo-400">rishu</code> · Password: <code className="text-indigo-600 dark:text-indigo-400">Password@123</code>
                    </div>
                  </div>
                </form>
              ) : (
                /* Method B: Google Sign In */
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-900 dark:text-white font-medium text-xs flex items-center justify-center gap-3 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{isSubmitting ? 'Verifying account...' : `Sign in with Google (${ADMIN_EMAIL})`}</span>
                  </button>

                  <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
                    Google popup will verify if your signed-in account is <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{ADMIN_EMAIL}</span>. Any other account will be denied.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
