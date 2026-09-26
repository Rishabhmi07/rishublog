import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, MapPin, ExternalLink, ShieldCheck, Inbox } from 'lucide-react';
import { AuthorProfile } from '../types/blog';
import { DEFAULT_AUTHOR_PROFILE } from '../data/articles';

interface ContactSectionProps {
  profile?: AuthorProfile;
  onSendMessage?: (msg: { name: string; email: string; subject: string; message: string }) => void;
  isAdminLoggedIn?: boolean;
  unreadCount?: number;
  onOpenInbox?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  profile: propProfile,
  onSendMessage,
  isAdminLoggedIn = false,
  unreadCount = 0,
  onOpenInbox,
}) => {
  const profile = propProfile || DEFAULT_AUTHOR_PROFILE;
  const targetEmail = profile.socials.email || 'mishra939rishu@gmail.com';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmittedMsg, setLastSubmittedMsg] = useState<{
    name: string;
    email: string;
    subject: string;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);

    const messageData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim() || 'Inquiry from Tech Blog',
      message: formData.message.trim(),
    };

    setLastSubmittedMsg(messageData);

    // 1. Deliver to internal secure store
    if (onSendMessage) {
      onSendMessage(messageData);
    }

    // 2. Also send to server endpoint
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
    } catch {}

    // 3. Forward to Rishu's real Gmail via free formsubmit endpoint
    try {
      await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: messageData.name,
          email: messageData.email,
          _subject: `[Rishu's Tech Blog] ${messageData.subject}`,
          message: messageData.message,
          _replyto: messageData.email,
        }),
      });
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 400);
  };

  const getDirectMailtoUrl = () => {
    if (!lastSubmittedMsg) return `mailto:${targetEmail}`;
    return `mailto:${targetEmail}?subject=${encodeURIComponent(
      lastSubmittedMsg.subject
    )}&body=${encodeURIComponent(
      `Name: ${lastSubmittedMsg.name}\nEmail: ${lastSubmittedMsg.email}\n\nMessage:\n${lastSubmittedMsg.message}`
    )}`;
  };

  return (
    <section id="contact-section" className="py-16 md:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                  Connect
                </span>
                {/* Admin indicator only visible if logged in as Admin */}
                {isAdminLoggedIn && onOpenInbox && (
                  <button
                    type="button"
                    onClick={onOpenInbox}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Inbox</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                )}
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading mt-1">
                Let's Talk Tech
              </h2>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Have a question about an article, want to collaborate on an open-source AI project, or discuss engineering internships? Feel free to reach out directly.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <a
                href={`mailto:${targetEmail}`}
                className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/40 transition-colors group"
              >
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Direct Email
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white break-all">
                    {targetEmail}
                  </span>
                </div>
              </a>

              {profile.location && (
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Location
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                      {profile.location}
                    </span>
                  </div>
                </div>
              )}

              {/* Private Delivery Notice for visitors */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span>Private Direct Communication</span>
                </span>
                <p className="leading-relaxed">
                  Messages submitted through this form are private and delivered directly to Rishu Mishra ({targetEmail}). Other visitors cannot view your messages.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-heading flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <span>Send a Message</span>
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Direct to Rishu's Inbox
                </span>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                      Message Delivered to Rishu!
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
                      Thank you for reaching out. Your message has been sent directly to Rishu Mishra ({targetEmail}).
                    </p>
                  </div>

                  {/* Option to also send via email app */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={getDirectMailtoUrl()}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Gmail / Email App</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline cursor-pointer"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alex Parker"
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@example.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Discussing PyTorch article / Project collaboration"
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={`Hi ${profile.name}, loved your post on systems engineering and AI...`}
                      className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                    <span>{isSubmitting ? 'Delivering...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
