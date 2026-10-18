import React, { useState, useRef } from 'react';
import {
  Mail,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Instagram,
  Youtube,
  GraduationCap,
  Code2,
  Camera,
  Upload,
  Link,
  X,
  RotateCcw,
  Check,
  Edit3,
  MapPin,
  Lock,
} from 'lucide-react';
import { AuthorProfile } from '../types/blog';
import { DEFAULT_AUTHOR_PROFILE } from '../data/articles';
import { EditProfileModal } from './EditProfileModal';

function compressAvatar(file: File, size = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface AboutSectionProps {
  onContactClick: () => void;
  profile?: AuthorProfile;
  onUpdateProfile?: (newProfile: AuthorProfile) => void;
  avatarUrl?: string;
  onAvatarChange?: (newAvatar: string) => void;
  isAdminLoggedIn?: boolean;
  onRequireAdminAuth?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onContactClick,
  profile: propProfile,
  onUpdateProfile,
  avatarUrl,
  onAvatarChange,
  isAdminLoggedIn = false,
  onRequireAdminAuth,
}) => {
  // Use passed profile or fallback to defaults
  const profile = propProfile || DEFAULT_AUTHOR_PROFILE;

  // Photo modal states
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoInputMode, setPhotoInputMode] = useState<'upload' | 'url'>('upload');
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Edit details modal state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentAvatar = avatarUrl || profile.avatar;

  const handleOpenPhotoModal = () => {
    if (!isAdminLoggedIn && onRequireAdminAuth) {
      onRequireAdminAuth();
      return;
    }
    setTempPhotoUrl(currentAvatar);
    setUrlInput('');
    setIsPhotoModalOpen(true);
  };

  const handleOpenEditProfile = () => {
    if (!isAdminLoggedIn && onRequireAdminAuth) {
      onRequireAdminAuth();
      return;
    }
    setIsEditProfileOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size exceeds 5MB. Please choose an image smaller than 5MB.');
        return;
      }
      setIsUploading(true);
      try {
        const compressed = await compressAvatar(file, 400, 0.85);
        setTempPhotoUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setTempPhotoUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setTempPhotoUrl(urlInput.trim());
    }
  };

  const handleResetToDefault = () => {
    setTempPhotoUrl(DEFAULT_AUTHOR_PROFILE.avatar);
  };

  const handleSavePhoto = () => {
    const finalPhoto = tempPhotoUrl || currentAvatar || DEFAULT_AUTHOR_PROFILE.avatar;
    if (onAvatarChange) {
      onAvatarChange(finalPhoto);
    }
    if (onUpdateProfile) {
      onUpdateProfile({ ...profile, avatar: finalPhoto });
    }
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      setIsPhotoModalOpen(false);
    }, 800);
  };

  const handleSaveFullProfile = (updated: AuthorProfile) => {
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    if (onAvatarChange && updated.avatar !== currentAvatar) {
      onAvatarChange(updated.avatar);
    }
  };

  return (
    <section id="about-section" className="py-16 md:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm text-center relative">
              {/* Profile Avatar with Change Photo Trigger (if Admin) */}
              <div className="relative w-36 h-36 mx-auto mb-4 group">
                <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-md bg-zinc-950">
                  <img
                    src={currentAvatar}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Hover Overlay only shown when Admin is logged in */}
                {isAdminLoggedIn && (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenPhotoModal}
                      title="Click to change photo"
                      className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
                    >
                      <Camera className="w-6 h-6 mb-1 text-white" />
                      <span className="text-[11px] font-semibold text-white tracking-wide">Change Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenPhotoModal}
                      title="Change profile photo"
                      className="absolute -bottom-1.5 -right-1.5 p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-zinc-900"
                      aria-label="Change profile photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {/* Developer quick action buttons: Change Photo & Edit Profile (Only when logged in as Admin) */}
              {isAdminLoggedIn && (
                <div className="flex items-center justify-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={handleOpenPhotoModal}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photo</span>
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">·</span>
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile & Socials</span>
                  </button>
                </div>
              )}

              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-heading">
                {profile.name}
              </h2>

              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                {profile.role}
              </p>

              {profile.location && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  <span>{profile.location}</span>
                </p>
              )}

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed">
                {profile.shortBio}
              </p>

              {/* Social Media Links */}
              <div className="pt-5 mt-5 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-center gap-2">
                {profile.socials.email && (
                  <a
                    href={`mailto:${profile.socials.email}`}
                    className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title={`Email ${profile.name}`}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}

                {profile.socials.github && (
                  <a
                    href={profile.socials.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="GitHub Profile"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}

                {profile.socials.linkedin && (
                  <a
                    href={profile.socials.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}

                {profile.socials.twitter && (
                  <a
                    href={profile.socials.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-sky-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Twitter / X Profile"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}

                {profile.socials.website && (
                  <a
                    href={profile.socials.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Personal Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}

                {profile.socials.instagram && (
                  <a
                    href={profile.socials.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-pink-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Instagram Profile"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}

                {profile.socials.youtube && (
                  <a
                    href={profile.socials.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="YouTube Channel"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-2 mt-4">
                {isAdminLoggedIn && (
                  <button
                    onClick={handleOpenEditProfile}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Customize Profile Details</span>
                  </button>
                )}

                <button
                  onClick={onContactClick}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Get in Touch
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Bio, Journey & Skills */}
          <div className="lg:col-span-8 space-y-12">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
                  About the Author
                </span>
                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Bio</span>
                  </button>
                )}
              </div>

              <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading mt-1">
                {profile.heading || 'Engineering with Curiosity & First Principles'}
              </h3>

              <div className="mt-4 space-y-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {profile.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            {/* Academic Journey Timeline */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-zinc-900 dark:text-white font-heading flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-500" />
                  <span>Academic & Engineering Journey</span>
                </h4>
                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Journey</span>
                  </button>
                )}
              </div>

              <div className="space-y-6 border-l-2 border-zinc-200 dark:border-zinc-800 pl-6 ml-3">
                {profile.milestones.map((m, idx) => (
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
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-zinc-900 dark:text-white font-heading flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-500" />
                  <span>Technical Stack & Tools</span>
                </h4>
                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Skills</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profile.skills.map((cat, idx) => (
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

      {/* Change Photo Modal (Admin Only) */}
      {isPhotoModalOpen && isAdminLoggedIn && (
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
                    src={tempPhotoUrl || currentAvatar}
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
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="profile-photo-upload"
                    className={`flex flex-col items-center justify-center p-5 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl cursor-pointer bg-zinc-50/50 dark:bg-zinc-800/30 transition-colors text-center ${
                      isUploading ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    <Upload className="w-7 h-7 text-indigo-500 mb-2" />
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {isUploading ? 'Optimizing photo...' : 'Choose an image from your computer'}
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-0.5">
                      Auto-compressed & resized (JPG, PNG, WEBP)
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
                    Paste any public image link (e.g. GitHub avatar, Unsplash portrait)
                  </p>
                </div>
              )}

              {/* Reset to Default Button */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
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

      {/* Edit Developer Profile Modal (Admin Only) */}
      {isEditProfileOpen && isAdminLoggedIn && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          profile={profile}
          onSave={handleSaveFullProfile}
        />
      )}
    </section>
  );
};
