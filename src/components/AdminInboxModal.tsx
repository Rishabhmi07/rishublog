import React, { useState } from 'react';
import {
  X,
  Mail,
  MailOpen,
  Trash2,
  Reply,
  Copy,
  Check,
  Search,
  CheckCheck,
  MessageSquare,
  Clock,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { ContactMessage } from '../types/blog';

interface AdminInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ContactMessage[];
  onMarkRead: (id: string, read: boolean) => void;
  onMarkAllRead: () => void;
  onDeleteMessage: (id: string) => void;
  onClearAll: () => void;
  onAddTestMessage?: () => void;
  onOpenPasscodeSettings?: () => void;
}

export const AdminInboxModal: React.FC<AdminInboxModalProps> = ({
  isOpen,
  onClose,
  messages,
  onMarkRead,
  onMarkAllRead,
  onDeleteMessage,
  onClearAll,
  onAddTestMessage,
  onOpenPasscodeSettings,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  if (!isOpen) return null;

  const unreadCount = messages.filter((m) => !m.read).length;

  const filteredMessages = messages.filter((m) => {
    if (filter === 'unread' && m.read) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => {
      setCopiedEmailId(null);
    }, 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
                  Admin Message Inbox
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono">
                  {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Read, manage, and reply to messages sent by visitors on your blog
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPasscodeSettings && (
              <button
                type="button"
                onClick={onOpenPasscodeSettings}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Change Admin Passcode"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Change Passcode</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Bulk Actions */}
        <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30 flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sender, email or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          {/* Filters & Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                All ({messages.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filter === 'unread'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                )}
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}

            {messages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all messages?')) {
                    onClearAll();
                  }
                }}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 font-medium text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                title="Clear all messages"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <MailOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white font-heading">
                  {searchQuery ? 'No matching messages found' : 'Your Inbox is Empty'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {searchQuery
                    ? `No messages matched "${searchQuery}". Try searching with another keyword.`
                    : 'Whenever someone submits the message form in the Contact section, their full message will appear right here with 1-click email reply!'}
                </p>
              </div>

              {!searchQuery && onAddTestMessage && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onAddTestMessage}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors cursor-pointer border border-indigo-200 dark:border-indigo-800"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Send a Test Message to Inbox</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const initials = msg.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={msg.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    msg.read
                      ? 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70'
                      : 'border-indigo-500/30 dark:border-indigo-500/40 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                  }`}
                >
                  {/* Sender Info Bar */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {initials || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                            {msg.name}
                          </h4>
                          {!msg.read && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold tracking-wide">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                            {msg.email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(msg.email, msg.id)}
                            className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Copy email address"
                          >
                            {copiedEmailId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(msg.createdAt)}</span>
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                      Subject
                    </span>
                    <h5 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {msg.subject || 'No Subject'}
                    </h5>
                  </div>

                  {/* Message Body */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </div>

                  {/* Message Action Footer */}
                  <div className="mt-3.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* One-click email reply */}
                      <a
                        href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(
                          msg.subject || 'Your message to Rishu'
                        )}&body=Hi ${encodeURIComponent(
                          msg.name
                        )},\n\nThank you for reaching out through my blog!\n\nBest regards,\nRishu Mishra`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => !msg.read && onMarkRead(msg.id, true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply via Email</span>
                      </a>

                      {/* Toggle Read/Unread */}
                      <button
                        type="button"
                        onClick={() => onMarkRead(msg.id, !msg.read)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                      >
                        {msg.read ? (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            <span>Mark as unread</span>
                          </>
                        ) : (
                          <>
                            <MailOpen className="w-3.5 h-3.5" />
                            <span>Mark as read</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Delete Message */}
                    <button
                      type="button"
                      onClick={() => onDeleteMessage(msg.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>
              {unreadCount > 0
                ? `${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}`
                : 'All messages caught up!'}
            </span>
            {onOpenPasscodeSettings && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                <button
                  type="button"
                  onClick={onOpenPasscodeSettings}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Passcode Settings</span>
                </button>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
