import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Link,
  Check,
  Trash2,
  Loader2,
  Pencil,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Article, CategoryItem } from '../types/blog';
import { AUTHOR_RISHU, PRESET_COVER_IMAGES } from '../data/articles';

// Client-side lightweight image compressor to keep uploads snappy and within browser storage limits
function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
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

interface NewArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (article: Article) => Promise<void> | void;
  articleToEdit?: Article | null;
  categories?: CategoryItem[];
}

export const NewArticleModal: React.FC<NewArticleModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  articleToEdit = null,
  categories = [],
}) => {
  const defaultCategory = categories[0]?.name || 'AI & Machine Learning';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(defaultCategory);
  const [shortDescription, setShortDescription] = useState('');
  const [readingTime, setReadingTime] = useState('5 min read');
  
  // Image selection state
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'preset' | 'url'>('upload');
  const [coverImage, setCoverImage] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Content state
  const [intro, setIntro] = useState('');
  const [sectionHeading, setSectionHeading] = useState('1. Core Implementation');
  const [sectionText, setSectionText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLang, setCodeLang] = useState('python');
  const [tags, setTags] = useState('AI, Machine Learning, Python');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize form when articleToEdit changes or modal opens
  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title || '');
      setCategory(articleToEdit.category || defaultCategory);
      setShortDescription(articleToEdit.shortDescription || '');
      setReadingTime(articleToEdit.readingTime || '5 min read');
      setCoverImage(articleToEdit.coverImage || '');
      setImageFileName(articleToEdit.coverImage ? 'Current Cover Image' : '');
      setIsFeatured(Boolean(articleToEdit.featured));
      setIntro(articleToEdit.content?.intro || '');
      setSectionHeading(articleToEdit.content?.sections?.[0]?.heading || '1. Core Implementation');
      setSectionText(articleToEdit.content?.sections?.[0]?.text || '');
      setCodeSnippet(articleToEdit.content?.sections?.[0]?.code?.snippet || '');
      setCodeLang(articleToEdit.content?.sections?.[0]?.code?.language || 'python');
      setTags(Array.isArray(articleToEdit.tags) ? articleToEdit.tags.join(', ') : '');
    } else {
      setTitle('');
      setCategory(defaultCategory);
      setShortDescription('');
      setReadingTime('5 min read');
      setCoverImage('');
      setImageFileName('');
      setImageUrlInput('');
      setIsFeatured(false);
      setIntro('');
      setSectionHeading('1. Core Implementation');
      setSectionText('');
      setCodeSnippet('');
      setCodeLang('python');
      setTags('AI, Machine Learning, Python');
    }
  }, [articleToEdit, isOpen]);

  if (!isOpen) return null;

  // Handle local file upload with fast compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageError(null);
      if (!file.type.startsWith('image/')) {
        setImageError('Please select a valid image file (PNG, JPG, WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image file size exceeds 5MB limit.');
        return;
      }
      setImageFileName(file.name);
      setIsCompressing(true);
      try {
        const compressedBase64 = await compressImage(file, 1200, 0.85);
        setCoverImage(compressedBase64);
      } catch {
        // Fallback to raw data url
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setCoverImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleApplyUrl = () => {
    if (imageUrlInput.trim()) {
      setCoverImage(imageUrlInput.trim());
      setImageFileName('Web Image');
    }
  };

  const handleSelectPreset = (url: string, name: string) => {
    setCoverImage(url);
    setImageFileName(name);
  };

  const handleClearImage = () => {
    setCoverImage('');
    setImageFileName('');
    setImageUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setPublishError(null);
    setPublishSuccess(null);

    // Fallback image if user didn't select one
    const finalImage = coverImage.trim() || PRESET_COVER_IMAGES[0].url;

    const finalArticle: Article = {
      id: articleToEdit ? articleToEdit.id : `art-${Date.now()}`,
      slug: articleToEdit
        ? articleToEdit.slug
        : title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, ''),
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      category,
      coverImage: finalImage,
      publishedDate: articleToEdit
        ? articleToEdit.publishedDate
        : new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
      publishedStatus: 'published',
      readingTime: readingTime.trim() || '4 min read',
      featured: isFeatured,
      author: articleToEdit?.author || AUTHOR_RISHU,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      likes: articleToEdit ? articleToEdit.likes : 0,
      content: {
        intro: intro.trim() || shortDescription.trim(),
        sections: [
          {
            heading: sectionHeading.trim() || '1. Overview & Setup',
            text: sectionText.trim() || shortDescription.trim(),
            ...(codeSnippet.trim()
              ? {
                  code: {
                    language: codeLang.trim() || 'text',
                    snippet: codeSnippet.trim(),
                  },
                }
              : {}),
          },
        ],
        conclusion:
          articleToEdit?.content?.conclusion ||
          'Thanks for reading! Check back regularly for updates or drop a comment below with your feedback.',
      },
    };

    try {
      await onPublish(finalArticle);
      setPublishSuccess(
        articleToEdit
          ? 'Article changes saved to Cloud Firestore!'
          : 'Article successfully published and saved to Cloud Firestore!'
      );
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsSubmitting(false);
      setPublishError(
        err?.message ||
          'Failed to persist article to Firestore. Please verify you are logged in as admin.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2">
            {articleToEdit ? (
              <Pencil className="w-5 h-5 text-indigo-500" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-500" />
            )}
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
              {articleToEdit ? 'Edit Article' : 'Write New Article'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error or Success notification */}
        {publishError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Persistence Error</p>
              <p>{publishError}</p>
            </div>
          </div>
        )}

        {publishSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{publishSuccess}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Article Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Fine-Tuning Vision Transformers for Edge Devices"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Programming">Programming</option>
                      <option value="Java">Java</option>
                      <option value="Python">Python</option>
                      <option value="Projects">Projects</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Estimated Reading Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 min read"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                  />
                  <span>Mark as Featured Post</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Short Summary / Abstract *
              </label>
              <textarea
                required
                rows={2}
                placeholder="A concise synopsis of the article that will appear on cards..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Section: COVER IMAGE OPTION */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  Article Cover Image
                </span>
              </div>
              {coverImage && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
              )}
            </div>

            {/* Image Selection Tabs */}
            <div className="flex items-center gap-1 p-1 bg-zinc-200/60 dark:bg-zinc-900 rounded-xl max-w-sm">
              <button
                type="button"
                onClick={() => setImageSourceType('upload')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  imageSourceType === 'upload'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                onClick={() => setImageSourceType('preset')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  imageSourceType === 'preset'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Presets</span>
              </button>
              <button
                type="button"
                onClick={() => setImageSourceType('url')}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  imageSourceType === 'url'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>URL</span>
              </button>
            </div>

            {/* Tab 1: Upload from device */}
            {imageSourceType === 'upload' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="article-file-upload"
                  disabled={isCompressing}
                />
                <label
                  htmlFor="article-file-upload"
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl cursor-pointer bg-white/50 dark:bg-zinc-900/50 transition-colors text-center ${
                    isCompressing ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-8 h-8 text-indigo-500 mb-2 animate-spin" />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                        Optimizing image for fast publishing...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-indigo-500 mb-2" />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                        Click to browse and upload an image from your device
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                        Auto-compressed for instant loading (PNG, JPG, WEBP)
                      </span>
                    </>
                  )}
                </label>
                {imageError && (
                  <p className="text-[11px] text-rose-500 font-medium pt-1">
                    {imageError}
                  </p>
                )}
              </div>
            )}

            {/* Tab 2: Choose from Tech Presets */}
            {imageSourceType === 'preset' && (
              <div className="space-y-2">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                  Select a curated cover illustration:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {PRESET_COVER_IMAGES.map((preset) => {
                    const isSelected = coverImage === preset.url;
                    return (
                      <div
                        key={preset.name}
                        onClick={() => handleSelectPreset(preset.url, preset.name)}
                        className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-4/3 bg-zinc-950 ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] text-white font-medium truncate">
                            {preset.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 p-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Direct Image URL */}
            {imageSourceType === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/images/my-cover.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Live Cover Image Preview */}
            {coverImage && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
                  <span>Cover Preview:</span>
                  {imageFileName && <span className="font-mono text-zinc-400 truncate max-w-xs">{imageFileName}</span>}
                </div>
                <div className="relative aspect-16/9 max-h-48 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-950">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Article Content */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Introduction Paragraph
              </label>
              <textarea
                rows={3}
                placeholder="Hook the reader: Why does this concept or project matter?"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                Primary Section & Code Example
              </span>
              <input
                type="text"
                placeholder="Section Heading (e.g. 1. Architectural Blueprint)"
                value={sectionHeading}
                onChange={(e) => setSectionHeading(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white"
              />
              <textarea
                rows={3}
                placeholder="Detailed explanations, formulas, or concepts..."
                value={sectionText}
                onChange={(e) => setSectionText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white resize-none"
              />
              <div className="flex gap-2 items-center">
                <span className="text-xs text-zinc-500">Language:</span>
                <input
                  type="text"
                  placeholder="python / c / javascript / java"
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="w-36 px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white"
                />
              </div>
              <textarea
                rows={5}
                placeholder="// Paste code snippet here..."
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-zinc-950 text-zinc-200 rounded-xl border border-zinc-800 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="AI, Machine Learning, Python, Neural Networks"
                className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCompressing}
              className={`px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-2 ${
                isSubmitting || isCompressing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{articleToEdit ? 'Saving...' : 'Publishing...'}</span>
                </>
              ) : (
                <span>{articleToEdit ? 'Save Changes' : 'Publish Article'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
