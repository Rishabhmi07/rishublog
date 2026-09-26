import React from 'react';
import { Mail, Github, Linkedin, Twitter, Globe, Instagram, Youtube, Edit3, Inbox, Lock, ShieldCheck } from 'lucide-react';
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
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  profile: propProfile,
  onEditProfile,
  onOpenInbox,
  unreadCount = 0,
  isAdminLoggedIn = false,
  onOpenAdminAuth,
}) => {
  const profile = propProfile || DEFAULT_AUTHOR_PROFILE;
  const firstName = profile.name.split(' ')[0] || 'Rishu';

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Identity */}
          <div className="text-center md:text-left space-y-1">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
              {firstName}<span className="text-indigo-600 dark:text-indigo-400">.</span>
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Personal Tech Blog by {profile.name} · {profile.role}
            </p>
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
                  title="Admin Lock"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Portal</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
