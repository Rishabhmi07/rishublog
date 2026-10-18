import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Instagram,
  Youtube,
  GraduationCap,
  Code2,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AuthorProfile } from '../types/blog';
import { DEFAULT_AUTHOR_PROFILE } from '../data/articles';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AuthorProfile;
  onSave: (updatedProfile: AuthorProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'socials' | 'journey' | 'skills'>('profile');

  // Form states
  const [formData, setFormData] = useState<AuthorProfile>(() => JSON.parse(JSON.stringify(profile)));
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleTextChange = (field: keyof AuthorProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field: keyof AuthorProfile['socials'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: {
        ...prev.socials,
        [field]: value,
      },
    }));
  };

  // Paragraph handlers
  const handleParagraphChange = (index: number, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.paragraphs];
      updated[index] = val;
      return { ...prev, paragraphs: updated };
    });
  };

  const handleAddParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      paragraphs: [...prev.paragraphs, ''],
    }));
  };

  const handleRemoveParagraph = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((_, i) => i !== index),
    }));
  };

  // Milestone handlers
  const handleMilestoneChange = (index: number, field: 'year' | 'title' | 'desc', val: string) => {
    setFormData((prev) => {
      const updated = [...prev.milestones];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, milestones: updated };
    });
  };

  const handleAddMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { year: 'Upcoming / New', title: 'New Milestone', desc: 'Description of your engineering achievement...' },
      ],
    }));
  };

  const handleRemoveMilestone = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  // Skill category handlers
  const handleSkillCategoryChange = (index: number, field: 'category' | 'skillsStr', val: string) => {
    setFormData((prev) => {
      const updated = [...prev.skills];
      if (field === 'category') {
        updated[index] = { ...updated[index], category: val };
      } else {
        const parsed = val.split(',').map((s) => s.trim()).filter(Boolean);
        updated[index] = { ...updated[index], skills: parsed };
      }
      return { ...prev, skills: updated };
    });
  };

  const handleAddSkillCategory = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        { category: 'New Category', skills: ['Skill 1', 'Skill 2'] },
      ],
    }));
  };

  const handleRemoveSkillCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all author and social details back to default?')) {
      setFormData(JSON.parse(JSON.stringify(DEFAULT_AUTHOR_PROFILE)));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
                Edit Developer Profile & Details
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Update your bio, social media handles, academic journey, and tech stack
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-50/30 dark:bg-zinc-900/30 overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Bio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('socials')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'socials'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Socials & Contact</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('journey')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'journey'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Journey</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'skills'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Tech Stack</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Profile & Bio */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Profile Avatar Editor */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                <img
                  src={formData.avatar || DEFAULT_AUTHOR_PROFILE.avatar}
                  alt={formData.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.opacity = '0.5';
                  }}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xs shrink-0 bg-zinc-900"
                />
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Profile Photo URL or Upload
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.avatar}
                      onChange={(e) => handleTextChange('avatar', e.target.value)}
                      placeholder="https://... or upload image"
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                    <label className="cursor-pointer py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0">
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Image exceeds 5MB limit.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (ev.target?.result) {
                                handleTextChange('avatar', ev.target.result as string);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-zinc-400">
                    Updating your photo here updates the navigation bar, articles, about section, and footer instantly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleTextChange('name', e.target.value)}
                    placeholder="Rishu Mishra"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Title / Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => handleTextChange('role', e.target.value)}
                    placeholder="3rd-Year B.Tech CSE (AI/ML) Student"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Location / College Detail
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleTextChange('location', e.target.value)}
                  placeholder="India · B.Tech CSE (AI/ML)"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Short Bio (Profile Card Overview) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.shortBio}
                  onChange={(e) => handleTextChange('shortBio', e.target.value)}
                  placeholder="Passionate software developer and undergraduate researcher..."
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Main About Section Heading
                </label>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => handleTextChange('heading', e.target.value)}
                  placeholder="Engineering with Curiosity & First Principles"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Detailed Story / Bio Paragraphs
                  </label>
                  <button
                    type="button"
                    onClick={handleAddParagraph}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Paragraph</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.paragraphs.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="text-[11px] font-mono text-zinc-400 pt-2 w-5">
                        #{idx + 1}
                      </span>
                      <textarea
                        rows={3}
                        value={p}
                        onChange={(e) => handleParagraphChange(idx, e.target.value)}
                        placeholder={`Paragraph ${idx + 1} content...`}
                        className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
                      />
                      {formData.paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParagraph(idx)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove paragraph"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Socials & Contact */}
          {activeTab === 'socials' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                These links appear in your profile card, footer, and contact section across the blog.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.socials.email}
                  onChange={(e) => handleSocialChange('email', e.target.value)}
                  placeholder="mishra939rishu@gmail.com"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                  <span>GitHub Profile URL</span>
                </label>
                <input
                  type="url"
                  value={formData.socials.github || ''}
                  onChange={(e) => handleSocialChange('github', e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                  <span>LinkedIn Profile URL</span>
                </label>
                <input
                  type="url"
                  value={formData.socials.linkedin || ''}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-500" />
                  <span>Twitter / X Profile URL</span>
                </label>
                <input
                  type="url"
                  value={formData.socials.twitter || ''}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="https://x.com/yourhandle"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Personal Website / Portfolio URL</span>
                </label>
                <input
                  type="url"
                  value={formData.socials.website || ''}
                  onChange={(e) => handleSocialChange('website', e.target.value)}
                  placeholder="https://rishumishra.dev"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.socials.instagram || ''}
                    onChange={(e) => handleSocialChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>YouTube Channel URL (Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.socials.youtube || ''}
                    onChange={(e) => handleSocialChange('youtube', e.target.value)}
                    placeholder="https://youtube.com/@yourchannel"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Academic Journey */}
          {activeTab === 'journey' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Highlight your education stages, achievements, and milestone goals.
                </p>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Milestone</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3 relative group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        Milestone #{idx + 1}
                      </span>
                      {formData.milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Period / Year
                        </label>
                        <input
                          type="text"
                          value={m.year}
                          onChange={(e) => handleMilestoneChange(idx, 'year', e.target.value)}
                          placeholder="e.g. Year 3 (Current)"
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                          placeholder="e.g. AI/ML Specialization & Cloud Architecture"
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Summary
                      </label>
                      <textarea
                        rows={2}
                        value={m.desc}
                        onChange={(e) => handleMilestoneChange(idx, 'desc', e.target.value)}
                        placeholder="What you learned, built, or researched..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Tech Stack & Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Group your skills by category and separate items with commas.
                </p>
                <button
                  type="button"
                  onClick={handleAddSkillCategory}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.skills.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={cat.category}
                        onChange={(e) => handleSkillCategoryChange(idx, 'category', e.target.value)}
                        placeholder="Category Name (e.g. Languages, Cloud, Frameworks)"
                        className="font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-transparent border-b border-zinc-300 dark:border-zinc-700 pb-0.5 focus:outline-hidden focus:border-indigo-500"
                      />
                      {formData.skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSkillCategory(idx)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete skill category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">
                        Skills (comma-separated):
                      </label>
                      <input
                        type="text"
                        value={cat.skills.join(', ')}
                        onChange={(e) => handleSkillCategoryChange(idx, 'skillsStr', e.target.value)}
                        placeholder="Python, PyTorch, Docker, Kubernetes"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                      />
                    </div>

                    {/* Preview tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cat.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 text-[10px] font-medium bg-zinc-200/80 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer inside form */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {isSavedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Profile Saved!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
