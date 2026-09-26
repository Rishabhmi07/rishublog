import React, { useState, useRef } from 'react';
import { Mail, Github, Linkedin, GraduationCap, Code2, Camera, Upload, Link, X, RotateCcw, Check } from 'lucide-react';
import { AUTHOR_RISHU } from '../data/articles';

interface AboutSectionProps {
  onContactClick: () => void;
  avatarUrl?: string;
  onAvatarChange?: (newAvatar: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onContactClick,
  avatarUrl,
  onAvatarChange,
}) => {
  const [avatar, setAvatar] = useState<string>(() => {
    return avatarUrl || localStorage.getItem('rishu_avatar') || AUTHOR_RISHU.avatar;
  });

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url'>('upload');
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenPhotoModal = () => {
    setTempPhotoUrl(avatar);
    setUrlInput('');
    setIsPhotoModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setTempPhotoUrl(urlInput.trim());
    }
  };

  const handleResetToDefault = () => {
    setTempPhotoUrl(AUTHOR_RISHU.avatar);
  };

  const handleSavePhoto = () => {
    const finalPhoto = tempPhotoUrl || AUTHOR_RISHU.avatar;
    setAvatar(finalPhoto);
    try {
      localStorage.setItem('rishu_avatar', finalPhoto);
    } catch {}
    if (onAvatarChange) {
      onAvatarChange(finalPhoto);
    }
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      setIsPhotoModalOpen(false);
    }, 800);
  };

  const milestones = [
    {
      year: 'Year 3 (Current)',
      title: 'AI/ML Specialization & Cloud Architecture',
      desc: 'Diving deep into PyTorch transformer models, computer vision pipelines, LLM fine-tuning, and scalable microservices on Docker & Cloud Run.',
    },
    {
      year: 'Year 2',
      title: 'Data Structures, Java OOP & Web Engineering',
      desc: 'Mastered memory graphs, algorithmic complexity, Java package structures, relational databases, and modern full-stack web development.',
    },
    {
      year: 'Year 1',
      title: 'Foundations of Computer Science & C',
      desc: 'Built low-level systems intuition through C memory pointers, CPU architecture, discrete mathematics, and boolean logic.',
    },
  ];

  const skillCategories = [
    {
      category: 'Languages',
      skills: ['Python', 'C / C++', 'Java', 'TypeScript', 'SQL', 'Bash'],
    },
    {
      category: 'AI & Data Science',
      skills: ['PyTorch', 'Scikit-Learn', 'NumPy', 'Pandas', 'Transformers', 'OpenCV'],
    },
    {
      category: 'Web & Infrastructure',
      skills: ['React', 'Node.js', 'Express', 'Tailwind CSS', 'Docker', 'Git & GitHub'],
    },
  ];

  return (
    <section id="about-section" className="py-16 md:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm text-center">
              {/* Profile Avatar with Change Photo Trigger */}
              <div className="relative w-36 h-36 mx-auto mb-5 group">
                <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-md bg-zinc-950">
                  <img
                    src={avatar}
                    alt={AUTHOR_RISHU.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Hover Overlay */}
                <button
                  type="button"
                  onClick={handleOpenPhotoModal}
                  title="Click to change photo"
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
                >
                  <Camera className="w-6 h-6 mb-1 text-white" />
                  <span className="text-[11px] font-semibold text-white tracking-wide">Change Photo</span>
                </button>

                {/* Permanent Corner Camera Button Badge */}
                <button
                  type="button"
                  onClick={handleOpenPhotoModal}
                  title="Change profile photo"
                  className="absolute -bottom-1.5 -right-1.5 p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-zinc-900"
                  aria-label="Change profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Direct "Change Photo" action link */}
              <button
                type="button"
                onClick={handleOpenPhotoModal}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-2 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Change Photo</span>
              </button>

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-heading">
                {AUTHOR_RISHU.name}
              </h2>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                {AUTHOR_RISHU.role}
              </p>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed">
                Passionate software developer and undergraduate researcher exploring the intersection of deep learning algorithms and production software systems.
              </p>

              <div className="pt-5 mt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-3">
                <a
                  href="mailto:mishra939rishu@gmail.com"
                  className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Email Rishu"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>

              <button
                onClick={onContactClick}
                className="w-full mt-4 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Get in Touch
              </button>
            </div>
          </div>

          {/* Right Column: Bio, Journey & Skills */}
          <div className="lg:col-span-8 space-y-12">
            <div>
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                About the Author
              </span>
              <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading mt-1">
                Engineering with Curiosity & First Principles
              </h3>
              <div className="mt-4 space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  Hey there! I'm <strong>Rishu Mishra</strong>, currently in my 3rd year pursuing a Bachelor of Technology in Computer Science and Engineering with a specialization in Artificial Intelligence and Machine Learning.
                </p>
                <p>
                  My philosophy around software engineering is simple: <em>to truly understand something, you must build it from scratch</em>. Whether that means allocating heap memory byte-by-byte in C, writing a matrix backpropagation routine in NumPy, or architecting a reactive single-page application in React, I believe in demystifying the black box.
                </p>
                <p>
                  This blog serves as my digital workshop—a place where I publish detailed notes, semester build logs, algorithmic breakdowns, and tutorials to help fellow students and developers navigate the rapidly evolving world of tech.
                </p>
              </div>
            </div>

            {/* Academic Journey Timeline */}
            <div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white font-heading mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-500" />
                <span>Academic & Engineering Journey</span>
              </h4>

              <div className="space-y-6 border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 ml-3">
                {milestones.map((m, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-indigo-600 bg-white dark:bg-zinc-950" />
                    <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {m.year}
                    </span>
                    <h5 className="text-base font-bold text-zinc-900 dark:text-white mt-1">
                      {m.title}
                    </h5>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Tooling & Stack */}
            <div>
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white font-heading mb-6 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-500" />
                <span>Technical Stack & Tools</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {skillCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                  >
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-3">
                      {cat.category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Photo Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-white font-heading">
                  Change Profile Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Photo Preview */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-lg bg-zinc-950 mb-2">
                  <img
                    src={tempPhotoUrl || avatar}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Profile Photo Preview
                </span>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('upload')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    photoInputMode === 'upload'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoInputMode('url')}
                  className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    photoInputMode === 'url'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Image URL</span>
                </button>
              </div>

              {/* Option 1: File Upload */}
              {photoInputMode === 'upload' && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="profile-photo-upload"
                  />
                  <label
                    htmlFor="profile-photo-upload"
                    className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30 transition-colors text-center"
                  >
                    <Upload className="w-7 h-7 text-indigo-500 mb-2" />
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Choose an image from your computer
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-0.5">
                      Supports JPG, PNG, WEBP
                    </span>
                  </label>
                </div>
              )}

              {/* Option 2: Image URL */}
              {photoInputMode === 'url' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/my-photo.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Paste any public image link (e.g., GitHub profile picture, Unsplash, etc.)
                  </p>
                </div>
              )}

              {/* Reset to Default Button */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to original portrait</span>
                </button>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  {isSavedNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Photo Saved!</span>
                    </>
                  ) : (
                    <span>Save Photo</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
