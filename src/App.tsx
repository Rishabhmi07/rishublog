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
import { EditProfileModal } from './components/EditProfileModal';
import { AdminInboxModal } from './components/AdminInboxModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Footer } from './components/Footer';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, AUTHOR_RISHU, DEFAULT_AUTHOR_PROFILE } from './data/articles';
import { Article, CategoryItem, AuthorProfile, ContactMessage } from './types/blog';

export default function App() {
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('rishu_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Explicitly purge the old default mock articles: art-1 through art-6
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

  const [profile, setProfile] = useState<AuthorProfile>(() => {
    try {
      const saved = localStorage.getItem('rishu_author_profile');
      const savedAvatar = localStorage.getItem('rishu_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_AUTHOR_PROFILE,
          ...parsed,
          avatar: savedAvatar || parsed.avatar || DEFAULT_AUTHOR_PROFILE.avatar,
          socials: { ...DEFAULT_AUTHOR_PROFILE.socials, ...(parsed.socials || {}) },
        };
      }
      if (savedAvatar) {
        return { ...DEFAULT_AUTHOR_PROFILE, avatar: savedAvatar };
      }
    } catch {}
    return DEFAULT_AUTHOR_PROFILE;
  });

  // Admin Authentication & Passcode State (Default passcode: rishu2026)
  const [adminPasscode, setAdminPasscode] = useState<string>(() => {
    try {
      return localStorage.getItem('rishu_admin_passcode') || 'rishu2026';
    } catch {
      return 'rishu2026';
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('rishu_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // Admin Contact Messages Inbox
  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem('rishu_contact_messages');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'msg-sample-1',
        name: 'Aditya Verma',
        email: 'aditya.verma@gmail.com',
        subject: 'Collaborating on PyTorch Computer Vision Project',
        message:
          'Hey Rishu! Loved your breakdown of tensor backpropagation and custom deep learning models. I am also working on an AI vision project for our semester expo. Would love to connect and discuss ideas!',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        read: false,
      },
    ];
  });

  const [activeView, setActiveView] = useState<string>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNewArticleOpen, setIsNewArticleOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    try {
      localStorage.setItem('rishu_admin_auth', 'true');
    } catch {}
  };

  const handleLogoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setIsInboxOpen(false);
    setIsEditProfileOpen(false);
    try {
      localStorage.removeItem('rishu_admin_auth');
    } catch {}
  };

  const handleUpdatePasscode = (newPasscode: string) => {
    setAdminPasscode(newPasscode);
    try {
      localStorage.setItem('rishu_admin_passcode', newPasscode);
    } catch {}
  };

  // Safe handler to open admin inbox: checks if logged in
  const handleOpenInboxSafe = () => {
    if (isAdminLoggedIn) {
      setIsInboxOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // Safe handler to open edit profile: checks if logged in
  const handleOpenEditProfileSafe = () => {
    if (isAdminLoggedIn) {
      setIsEditProfileOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleUpdateProfile = (updated: AuthorProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem('rishu_author_profile', JSON.stringify(updated));
      localStorage.setItem('rishu_avatar', updated.avatar);
    } catch {}
    AUTHOR_RISHU.name = updated.name;
    AUTHOR_RISHU.role = updated.role;
    AUTHOR_RISHU.avatar = updated.avatar;
  };

  const handleAvatarChange = (newAvatar: string) => {
    const updated = { ...profile, avatar: newAvatar };
    handleUpdateProfile(updated);
  };

  // Contact message handlers
  const handleSendMessage = (msgData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...msgData,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => {
      const updated = [newMsg, ...prev];
      try {
        localStorage.setItem('rishu_contact_messages', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleMarkRead = (id: string, read: boolean) => {
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, read } : m));
      try {
        localStorage.setItem('rishu_contact_messages', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleMarkAllRead = () => {
    setMessages((prev) => {
      const updated = prev.map((m) => ({ ...m, read: true }));
      try {
        localStorage.setItem('rishu_contact_messages', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem('rishu_contact_messages', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAllMessages = () => {
    setMessages([]);
    try {
      localStorage.setItem('rishu_contact_messages', JSON.stringify([]));
    } catch {}
  };

  const handleAddTestMessage = () => {
    handleSendMessage({
      name: 'Priya Sharma',
      email: 'priya.sharma@techuniv.edu',
      subject: 'Question on C Memory Pointers & Heap Allocation',
      message:
        'Hello Rishu, your blog post on C memory allocation and pointers demystified a topic I was struggling with in my systems class. Thank you for publishing such detailed notes!',
    });
  };

  // Sync articles to local storage
  const handlePublishArticle = (newArticle: Article) => {
    const articleWithAuthor: Article = {
      ...newArticle,
      author: {
        name: profile.name,
        role: profile.role,
        avatar: profile.avatar,
      },
    };
    const updated = [articleWithAuthor, ...articles];
    setArticles(updated);
    try {
      localStorage.setItem('rishu_articles', JSON.stringify(updated));
    } catch {}
    setSelectedArticle(articleWithAuthor);
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

  // Navigation controller
  const handleNavigate = (view: string, targetId?: string) => {
    setSelectedArticle(null);
    setActiveView(view);

    if (view === 'home' && targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Global keyboard shortcuts (Cmd+K for search, Ctrl+Shift+A for Admin Login)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setIsAuthModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute category counts
  const categoriesWithCounts: CategoryItem[] = INITIAL_CATEGORIES.map((cat) => ({
    ...cat,
    articleCount: articles.filter((a) => a.category === cat.name).length,
  }));

  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const relatedArticles = selectedArticle
    ? articles.filter(
        (a) => a.id !== selectedArticle.id && a.category === selectedArticle.category
      ).slice(0, 3)
    : [];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        {/* Navigation Bar */}
        <Navbar
          activeView={activeView}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewArticle={() => setIsNewArticleOpen(true)}
          profile={profile}
          onEditProfile={handleOpenEditProfileSafe}
          isAdminLoggedIn={isAdminLoggedIn}
          unreadCount={unreadMessagesCount}
          onOpenInbox={handleOpenInboxSafe}
          onOpenAdminAuth={() => setIsAuthModalOpen(true)}
          onLogoutAdmin={handleLogoutAdmin}
        />

        {/* Main Content Areas */}
        <main className="flex-1">
          {selectedArticle ? (
            /* Dedicated Single Article Detail View */
            <ArticleDetailView
              article={selectedArticle}
              onBack={() => {
                setSelectedArticle(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onLike={handleLikeArticle}
              isBookmarked={bookmarks.includes(selectedArticle.id)}
              onToggleBookmark={handleToggleBookmark}
              relatedArticles={relatedArticles}
              onSelectArticle={(art) => {
                setSelectedArticle(art);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={handleDeleteArticle}
            />
          ) : (
            /* Views depending on route */
            <>
              {/* Home View */}
              {activeView === 'home' && (
                <>
                  <Hero
                    articleCount={articles.length}
                    profile={profile}
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
                    profile={profile}
                    onUpdateProfile={handleUpdateProfile}
                    avatarUrl={profile.avatar}
                    onAvatarChange={handleAvatarChange}
                    isAdminLoggedIn={isAdminLoggedIn}
                    onRequireAdminAuth={() => setIsAuthModalOpen(true)}
                    onContactClick={() => {
                      const el = document.getElementById('contact-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />

                  <ContactSection
                    profile={profile}
                    onSendMessage={handleSendMessage}
                    isAdminLoggedIn={isAdminLoggedIn}
                    unreadCount={unreadMessagesCount}
                    onOpenInbox={handleOpenInboxSafe}
                  />
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
                    profile={profile}
                    onUpdateProfile={handleUpdateProfile}
                    avatarUrl={profile.avatar}
                    onAvatarChange={handleAvatarChange}
                    isAdminLoggedIn={isAdminLoggedIn}
                    onRequireAdminAuth={() => setIsAuthModalOpen(true)}
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
                  <ContactSection
                    profile={profile}
                    onSendMessage={handleSendMessage}
                    isAdminLoggedIn={isAdminLoggedIn}
                    unreadCount={unreadMessagesCount}
                    onOpenInbox={handleOpenInboxSafe}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* Global Footer */}
        <Footer
          onNavigate={handleNavigate}
          profile={profile}
          onEditProfile={handleOpenEditProfileSafe}
          unreadCount={unreadMessagesCount}
          onOpenInbox={handleOpenInboxSafe}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminAuth={() => setIsAuthModalOpen(true)}
        />

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

        {/* Edit Profile Modal (Only opens if logged in) */}
        {isAdminLoggedIn && (
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            profile={profile}
            onSave={handleUpdateProfile}
          />
        )}

        {/* Admin Inbox Modal (Only opens if logged in) */}
        {isAdminLoggedIn && (
          <AdminInboxModal
            isOpen={isInboxOpen}
            onClose={() => setIsInboxOpen(false)}
            messages={messages}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDeleteMessage={handleDeleteMessage}
            onClearAll={handleClearAllMessages}
            onAddTestMessage={handleAddTestMessage}
            onOpenPasscodeSettings={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* Admin Authentication & Passcode Lock Modal */}
        <AdminAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAdminLoginSuccess}
          currentPasscode={adminPasscode}
          onUpdatePasscode={handleUpdatePasscode}
          isLoggedIn={isAdminLoggedIn}
          onLogout={handleLogoutAdmin}
          onOpenInbox={() => setIsInboxOpen(true)}
        />
      </div>
    </ThemeProvider>
  );
}
