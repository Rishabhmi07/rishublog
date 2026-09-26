import React from 'react';
import { Mail, Github, Linkedin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Identity */}
          <div className="text-center md:text-left space-y-1">
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
              Rishu<span className="text-indigo-600 dark:text-indigo-400">.</span>
            </span>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Personal Tech Blog by Rishu Mishra · 3rd-Year B.Tech CSE (AI/ML)
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <button onClick={() => onNavigate('home')} className="hover:text-indigo-600 transition-colors">
              Home
            </button>
            <button onClick={() => onNavigate('articles')} className="hover:text-indigo-600 transition-colors">
              Articles
            </button>
            <button onClick={() => onNavigate('categories')} className="hover:text-indigo-600 transition-colors">
              Categories
            </button>
            <button onClick={() => onNavigate('about')} className="hover:text-indigo-600 transition-colors">
              About
            </button>
            <button onClick={() => onNavigate('contact')} className="hover:text-indigo-600 transition-colors">
              Contact
            </button>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="mailto:mishra939rishu@gmail.com"
              className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© {new Date().getFullYear()} Rishu Mishra. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with React, TypeScript & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};
