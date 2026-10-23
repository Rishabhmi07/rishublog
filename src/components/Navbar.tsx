import React, { useState } from 'react';
import { Search, Sun, Moon, PenSquare, Menu, X, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AuthorProfile } from '../types/blog';

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string, targetId?: string) => void;
  onOpenSearch: () => void;
  onOpenNewArticle: () => void;
  profile?: AuthorProfile;
  onEditProfile?: () => void;
  isAdminLoggedIn?: boolean;
  unreadCount?: number;
  onOpenInbox?: () => void;
  onOpenAdminAuth?: () => void;
  onLogoutAdmin?: () => void;
  onOpenCategories?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  onOpenSearch,
  onOpenNewArticle,
  profile,
  onEditProfile,
  isAdminLoggedIn = false,
  unreadCount = 0,
  onOpenInbox,
  onOpenAdminAuth,
  onLogoutAdmin,
  onOpenCategories,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Articles', id: 'articles' },
    { label: 'Categories', id: 'categories' },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Rishu';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading hover:opacity-90 transition-opacity cursor-pointer"
          >
            {profile?.avatar && (
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-7 h-7 rounded-full object-cover border border-indigo-200 dark:border-indigo-800 shadow-2xs"
              />
            )}
            <span>{firstName}<span className="text-indigo-600 dark:text-indigo-400">.</span></span>
          </button>

          {/* Admin badge if active */}
          {isAdminLoggedIn && (
            <button
              onClick={onOpenAdminAuth}
              title="Admin authenticated - Click to manage admin settings"
              className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs cursor-pointer hover:bg-emerald-100"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Admin Active</span>
            </button>
          )}
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative py-1 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer"
            title="Search articles (Cmd+K)"
          >
            <Search className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {/* Write / New Article Button - ONLY visible to Admin */}
          {isAdminLoggedIn && (
            <button
              onClick={onOpenNewArticle}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg cursor-pointer"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2 text-sm rounded-lg font-medium transition-colors cursor-pointer ${
                  activeView === link.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-zinc-700" />
                )}
                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </div>
              <span className="text-xs text-zinc-400 uppercase font-mono">{theme}</span>
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={() => {
                  onOpenNewArticle();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer"
              >
                <PenSquare className="w-4 h-4" />
                <span>Create New Article</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
