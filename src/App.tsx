import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedArticle } from './components/FeaturedArticle';
import { ArticleGrid } from './components/ArticleGrid';
import { CategoriesSection } from './components/CategoriesSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { ArticleDetailView } from './components/ArticleDetailView';
import { SearchModal } from './components/SearchModal';
import { NewArticleModal } from './components/NewArticleModal';
import { Footer } from './components/Footer';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, AUTHOR_RISHU } from './data/articles';
import { Article, CategoryItem } from './types/blog';

export default function App() {
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('rishu_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Explicitly purge the old default articles: art-1 through art-6
          const userOnly = parsed.filter(
            (a) => !['art-1', 'art-2', 'art-3', 'art-4', 'art-5', 'art-6'].includes(a.id)
          );
          localStorage.setItem('rishu_articles', JSON.stringify(userOnly));
          return userOnly;
        }
      }
    } catch {}
    return INITIAL_ARTICLES;
  });

  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rishu_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeView, setActiveView] = useState<string>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNewArticleOpen, setIsNewArticleOpen] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string>(() => {
    try {
      return localStorage.getItem('rishu_avatar') || AUTHOR_RISHU.avatar;
    } catch {
      return AUTHOR_RISHU.avatar;
    }
  });

  const handleAvatarChange = (newAvatar: string) => {
    setAvatar(newAvatar);
    AUTHOR_RISHU.avatar = newAvatar;
  };

  // Sync articles to local storage
  const handlePublishArticle = (newArticle: Article) => {
    const updated = [newArticle, ...articles];
    setArticles(updated);
    try {
      localStorage.setItem('rishu_articles', JSON.stringify(updated));
    } catch {}
    setSelectedArticle(newArticle);
  };

  // Delete article handler
  const handleDeleteArticle = (id: string) => {
    const updated = articles.filter((art) => art.id !== id);
    setArticles(updated);
    try {
      localStorage.setItem('rishu_articles', JSON.stringify(updated));
    } catch {}

    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Like article handler
  const handleLikeArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticles((prev) => {
      const updated = prev.map((art) =>
        art.id === id ? { ...art, likes: art.likes + 1 } : art
      );
      try {
        localStorage.setItem('rishu_articles', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }
  };

  // Bookmark toggle handler
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem('rishu_bookmarks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Navigation handler
  const handleNavigate = (view: string) => {
    setSelectedArticle(null);
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcut for Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute categories with dynamic counts
  const categoriesWithCounts: CategoryItem[] = INITIAL_CATEGORIES.map((cat) => ({
    ...cat,
    articleCount: articles.filter((a) => a.category === cat.name).length,
  }));

  const featuredArticle = articles.find((a) => a.featured) || (articles.length > 0 ? articles[0] : null);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
        {/* Navigation */}
        <Navbar
          activeView={activeView}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewArticle={() => setIsNewArticleOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1">
          {selectedArticle ? (
            <ArticleDetailView
              article={selectedArticle}
              onBack={() => {
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLike={handleLikeArticle}
              isBookmarked={bookmarks.includes(selectedArticle.id)}
              onToggleBookmark={handleToggleBookmark}
              relatedArticles={articles.filter((a) => a.id !== selectedArticle.id)}
              onSelectArticle={(art) => {
                setSelectedArticle(art);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={handleDeleteArticle}
            />
          ) : (
            <>
              {/* Home View */}
              {activeView === 'home' && (
                <>
                  <Hero
                    articleCount={articles.length}
                    onExploreArticles={() => {
                      const el = document.getElementById('articles-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    onAboutMe={() => {
                      const el = document.getElementById('about-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />

                  {/* Featured Article Section (only if articles exist) */}
                  {featuredArticle && (
                    <FeaturedArticle
                      article={featuredArticle}
                      onReadArticle={(art) => {
                        setSelectedArticle(art);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onLikeArticle={handleLikeArticle}
                    />
                  )}

                  <ArticleGrid
                    articles={articles}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => setSelectedCategory(cat)}
                    onReadArticle={(art) => {
                      setSelectedArticle(art);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onLikeArticle={handleLikeArticle}
                    bookmarks={bookmarks}
                    onToggleBookmark={handleToggleBookmark}
                    onDeleteArticle={handleDeleteArticle}
                    onOpenNewArticle={() => setIsNewArticleOpen(true)}
                  />

                  <CategoriesSection
                    categories={categoriesWithCounts}
                    onSelectCategory={(catName) => {
                      setSelectedCategory(catName);
                      setActiveView('articles');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />

                  <AboutSection
                    avatarUrl={avatar}
                    onAvatarChange={handleAvatarChange}
                    onContactClick={() => {
                      const el = document.getElementById('contact-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />

                  <ContactSection />
                </>
              )}

              {/* Dedicated Articles View */}
              {activeView === 'articles' && (
                <div className="pt-6">
                  <ArticleGrid
                    articles={articles}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(cat) => setSelectedCategory(cat)}
                    onReadArticle={(art) => {
                      setSelectedArticle(art);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onLikeArticle={handleLikeArticle}
                    bookmarks={bookmarks}
                    onToggleBookmark={handleToggleBookmark}
                    onDeleteArticle={handleDeleteArticle}
                    onOpenNewArticle={() => setIsNewArticleOpen(true)}
                  />
                </div>
              )}

              {/* Dedicated Categories View */}
              {activeView === 'categories' && (
                <div className="pt-6">
                  <CategoriesSection
                    categories={categoriesWithCounts}
                    onSelectCategory={(catName) => {
                      setSelectedCategory(catName);
                      setActiveView('articles');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}

              {/* Dedicated About View */}
              {activeView === 'about' && (
                <div className="pt-6">
                  <AboutSection
                    avatarUrl={avatar}
                    onAvatarChange={handleAvatarChange}
                    onContactClick={() => {
                      setActiveView('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}

              {/* Dedicated Contact View */}
              {activeView === 'contact' && (
                <div className="pt-6">
                  <ContactSection />
                </div>
              )}
            </>
          )}
        </main>

        {/* Global Footer */}
        <Footer onNavigate={handleNavigate} />

        {/* Modals */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          articles={articles}
          onSelectArticle={(art) => {
            setSelectedArticle(art);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <NewArticleModal
          isOpen={isNewArticleOpen}
          onClose={() => setIsNewArticleOpen(false)}
          onPublish={handlePublishArticle}
        />
      </div>
    </ThemeProvider>
  );
}
