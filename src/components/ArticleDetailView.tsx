import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Share2,
  Bookmark,
  Check,
  Copy,
  MessageCircle,
  Sparkles,
  Send,
  User,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Article, CommentItem } from '../types/blog';

interface ArticleDetailViewProps {
  article: Article;
  onBack: () => void;
  onLike: (id: string, e: React.MouseEvent) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  relatedArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onDelete?: (id: string) => void;
  onEdit?: (article: Article) => void;
  authorAvatar?: string;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  onBack,
  onLike,
  isBookmarked,
  onToggleBookmark,
  relatedArticles,
  onSelectArticle,
  onDelete,
  onEdit,
  authorAvatar,
}) => {
  const displayAvatar = authorAvatar || article.author?.avatar;
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>(() => {
    try {
      const saved = localStorage.getItem(`comments_${article.id}`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'c1',
          articleId: article.id,
          authorName: 'Aditya Sharma',
          content: 'This was explained so cleanly! Especially the practical code snippets.',
          createdAt: '2 days ago',
        },
      ];
    } catch {
      return [];
    }
  });

  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyCode = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.shortDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: Date.now().toString(),
      articleId: article.id,
      authorName: newCommentName.trim(),
      content: newCommentText.trim(),
      createdAt: 'Just now',
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(`comments_${article.id}`, JSON.stringify(updated));
    } catch {}

    setNewCommentText('');
    setNewCommentName('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-indigo-600 dark:bg-indigo-400 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Top Header / Back Bar */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) => onLike(article.id, e)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span className="font-mono tabular-nums">{article.likes}</span>
            </button>

            <button
              onClick={(e) => onToggleBookmark(article.id, e)}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
              title={isBookmarked ? 'Bookmarked' : 'Bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
              title="Share article"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {onEdit && (
              <button
                onClick={() => onEdit(article)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold transition-colors shadow-2xs"
                title="Edit article"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Article</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this article?')) {
                    onDelete(article.id);
                  }
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete article"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        {/* Article Meta Header */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {article.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedDate}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-white font-heading leading-tight" style={{ textWrap: 'balance' }}>
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
            {article.shortDescription}
          </p>

          {/* Author Badge */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={displayAvatar}
                alt={article.author.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.opacity = '0.5';
                }}
                className="w-11 h-11 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-2xs"
              />
              <div>
                <span className="block text-sm font-semibold text-zinc-900 dark:text-white">
                  {article.author.name}
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {article.author.role}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="text-xs text-zinc-500 dark:text-zinc-400">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Big Cover Image */}
        <div className="relative aspect-16/9 rounded-3xl overflow-hidden mb-12 shadow-lg bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <img
            src={article.coverImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-[17px]">
          {/* Introduction */}
          <div className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 font-normal border-l-2 border-indigo-600 pl-4 py-1 italic bg-indigo-50/30 dark:bg-indigo-950/20 rounded-r-xl">
            {article.content.intro}
          </div>

          {/* Sections */}
          {article.content.sections.map((section, idx) => (
            <div key={idx} className="space-y-4 pt-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white font-heading tracking-tight">
                {section.heading}
              </h2>

              <p className="leading-relaxed">{section.text}</p>

              {/* Bullet points if present */}
              {section.bulletPoints && (
                <ul className="space-y-2 my-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                  {section.bulletPoints.map((point, pIdx) => (
                    <li key={pIdx} className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">
                      • {point}
                    </li>
                  ))}
                </ul>
              )}

              {/* Code Snippet */}
              {section.code && (
                <div className="my-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md">
                  <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs font-mono text-zinc-400">
                    <span>{section.code.filename || section.code.language}</span>
                    <button
                      onClick={() =>
                        handleCopyCode(section.code!.snippet, `${idx}-${section.code!.language}`)
                      }
                      className="flex items-center gap-1 px-2 py-1 hover:text-white rounded transition-colors"
                    >
                      {copiedSnippet === `${idx}-${section.code.language}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
                    <code>{section.code.snippet}</code>
                  </pre>
                </div>
              )}

              {/* Callout box */}
              {section.callout && (
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-xs sm:text-sm text-purple-900 dark:text-purple-200 flex items-start gap-3 my-4">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold mb-0.5">Key Engineering Note:</strong>
                    <span>{section.callout}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Conclusion */}
          <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-heading">
              Wrapping Up
            </h3>
            <p className="text-base text-zinc-600 dark:text-zinc-300">
              {article.content.conclusion}
            </p>
          </div>
        </div>

        {/* Interactive Comments Section */}
        <section className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-heading">
                Discussion ({comments.length})
              </h3>
            </div>
          </div>

          {/* Comment submission form */}
          <form
            onSubmit={handleAddComment}
            className="mb-8 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
          >
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              Leave a thoughtful response or question:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Your Name"
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <textarea
              required
              rows={3}
              placeholder="What are your thoughts on this approach?"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-hidden focus:border-indigo-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Comment</span>
              </button>
            </div>
          </form>

          {/* Comment list */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {comment.authorName[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {comment.authorName}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">{comment.createdAt}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-9">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white font-heading mb-6">
              More from Rishu's Tech Blog
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 2).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="group p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500/40 transition-all cursor-pointer flex gap-4"
                >
                  <img
                    src={rel.coverImage}
                    alt={rel.title}
                    referrerPolicy="no-referrer"
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white font-heading line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {rel.title}
                    </h4>
                    <span className="text-[11px] text-zinc-400 block">{rel.readingTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
};
