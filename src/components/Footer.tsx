import React from 'react';
import {
  Mail,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Instagram,
  Youtube,
  Edit3,
  Inbox,
  Lock,
  ShieldCheck,
  Tags,
  UserCog,
  PenSquare,
} from 'lucide-react';
import { AuthorProfile } from '../types/blog';
import { DEFAULT_AUTHOR_PROFILE } from '../data/articles';

interface FooterProps {
  onNavigate: (view: string) => void;
  profile?: AuthorProfile;
  onEditProfile?: () => void;
  onOpenInbox?: () => void;
  unreadCount?: number;
  isAdminLoggedIn?: boolean;
  onOpenAdminAuth?: () => void;
  onOpenCategories?: () => void;
  onLogoutAdmin?: () => void;
  onOpenNewArticle?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  profile: propProfile,
  onEditProfile,
  onOpenInbox,
  unreadCount = 0,
  isAdminLoggedIn = false,
  onOpenAdminAuth,
  onOpenCategories,
  onLogoutAdmin,
  onOpenNewArticle,
}) => {
  const profile = propProfile || DEFAULT_AUTHOR_PROFILE;
  const firstName = profile.name.split(' ')[0] || 'Rishu';

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3">
            {profile?.avatar && (
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 shadow-2xs shrink-0"
              />
            )}
            <div className="text-center md:text-left space-y-0.5">
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
                {firstName}<span className="text-indigo-600 dark:text-indigo-400">.</span>
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Personal Tech Blog by {profile.name} · {profile.role}
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <button onClick={() => onNavigate('home')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Home
            </button>
            <button onClick={() => onNavigate('articles')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Articles
            </button>
            <button onClick={() => onNavigate('categories')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Categories
            </button>
            <button onClick={() => onNavigate('about')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              About
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Contact
            </button>

            {/* Admin only links (Hidden from regular visitors) */}
            {isAdminLoggedIn ? (
              <>
                {onOpenInbox && (
                  <button
                    onClick={onOpenInbox}
                    className="hover:text-indigo-600 text-indigo-600 dark:text-indigo-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>Admin Inbox</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}

                {onEditProfile && (
                  <button
                    onClick={onEditProfile}
                    className="hover:text-indigo-600 text-zinc-500 dark:text-zinc-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </>
            ) : (
              onOpenAdminAuth && (
                <button
                  onClick={onOpenAdminAuth}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Owner Access"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin</span>
                </button>
              )
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {profile.socials.email && (
              <a
                href={`mailto:${profile.socials.email}`}
                className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
            {profile.socials.github && (
              <a
                href={profile.socials.github}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {profile.socials.linkedin && (
              <a
                href={profile.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {profile.socials.twitter && (
              <a
                href={profile.socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {profile.socials.website && (
              <a
                href={profile.socials.website}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
            {profile.socials.instagram && (
              <a
                href={profile.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-zinc-500 hover:text-pink-500 dark:text-zinc-400 dark:hover:text-pink-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {profile.socials.youtube && (
              <a
                href={profile.socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Dedicated Admin Box (Admin Message Inbox, Manage Categories, Edit Profile, Lock Session) */}
        {isAdminLoggedIn && (
          <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white font-heading">
                      Admin Box
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Active Session
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Administrator management controls & shortcuts
                  </p>
                </div>
              </div>

              {onLogoutAdmin && (
                <button
                  type="button"
                  onClick={onLogoutAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
                  title="Lock Admin session"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Admin Session</span>
                </button>
              )}
            </div>

            {/* Quick Actions Grid inside Admin Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              {/* 1. Admin Message Inbox */}
              {onOpenInbox && (
                <button
                  type="button"
                  onClick={onOpenInbox}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/80 hover:bg-indigo-50/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/70 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left cursor-pointer group shadow-2xs"
                >
                  <div className="relative p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                    <Inbox className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        Admin Message Inbox
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                          ({unreadCount} new)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {unreadCount > 0 ? `${unreadCount} unread message(s)` : 'View visitor messages'}
                    </p>
                  </div>
                </button>
              )}

              {/* 2. Manage Blog Categories & Topics */}
              {onOpenCategories && (
                <button
                  type="button"
                  onClick={onOpenCategories}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/80 hover:bg-purple-50/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/70 hover:border-purple-300 dark:hover:border-purple-700 transition-all text-left cursor-pointer group shadow-2xs"
                >
                  <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                    <Tags className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      Manage Categories
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      Topics, tracks & taxonomy
                    </p>
                  </div>
                </button>
              )}

              {/* 3. Edit Developer Profile, Bio & Socials */}
              {onEditProfile && (
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/80 hover:bg-blue-50/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/70 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left cursor-pointer group shadow-2xs"
                >
                  <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                    <UserCog className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      Edit Profile & Bio
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      Photo, role, bio & socials
                    </p>
                  </div>
                </button>
              )}

              {/* 4. Write / New Article */}
              {onOpenNewArticle && (
                <button
                  type="button"
                  onClick={onOpenNewArticle}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/80 hover:bg-emerald-50/50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/70 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left cursor-pointer group shadow-2xs"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <PenSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      Create New Article
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      Compose technical write-up
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Built with React, TypeScript & Tailwind CSS</span>
            {isAdminLoggedIn ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Logged In</span>
              </span>
            ) : (
              onOpenAdminAuth && (
                <button
                  onClick={onOpenAdminAuth}
                  className="text-zinc-400 hover:text-indigo-500 transition-colors cursor-pointer flex items-center gap-1"
                  title="Administrator login"
                  aria-label="Administrator login"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
