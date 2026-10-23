import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
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
import {
  auth,
  signOut,
  onAuthStateChanged,
  isUserAdmin,
  ADMIN_EMAIL,
} from './firebase';
import { User } from 'firebase/auth';
import {
  getArticlesFromFirestore,
  subscribeToArticles,
  saveArticleToFirestore,
  deleteArticleFromFirestore,
  incrementArticleLikesInFirestore,
  getAuthorProfileFromFirestore,
  saveAuthorProfileToFirestore,
  sendContactMessageToFirestore,
  subscribeToMessages,
  deleteMessageFromFirestore,
  updateMessageReadStatusInFirestore,
  getCategoriesFromFirestore,
  subscribeToCategories,
  saveCategoryToFirestore,
  renameCategoryInFirestore,
  deleteCategoryWithReassignment,
  seedInitialCategoriesIfEmpty,
  formatDocToArticle,
  updateArticlesAuthorAvatarInFirestore,
} from './services/blogService';
import { PRESET_COVER_IMAGES } from './data/articles';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Admin session token (set upon successful Admin login)
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('rishu_admin_token') || null;
    } catch {
      return null;
    }
  });

  const [adminUsername, setAdminUsername] = useState<string>(() => {
    try {
      return localStorage.getItem('rishu_admin_username') || 'rishu';
    } catch {
      return 'rishu';
    }
  });

  // Effective Admin status: either Google Auth matches ADMIN_EMAIL or verified Admin Token exists
  const isAdminLoggedIn = Boolean(
    isUserAdmin(currentUser) || (adminToken && adminToken.length > 0)
  );

  const [isLoadingArticles, setIsLoadingArticles] = useState<boolean>(true);
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('rishu_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((a: any) => formatDocToArticle(a.id, a));
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

  // Admin Contact Messages Inbox
  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem('rishu_contact_messages');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  // Admin-managed Categories state
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('rishu_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_CATEGORIES;
  });

  const [activeView, setActiveView] = useState<string>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNewArticleOpen, setIsNewArticleOpen] = useState<boolean>(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'credentials' | 'categories'>('credentials');
  const [categoryToEditInModal, setCategoryToEditInModal] = useState<CategoryItem | null>(null);
  const [openAddCategoryInModal, setOpenAddCategoryInModal] = useState<boolean>(false);

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  // 1. Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load articles from Firestore & Server in parallel and sync in real-time
  useEffect(() => {
    let isMounted = true;

    // Helper to merge two article lists, deduplicating by ID and sorting newest first
    const mergeArticles = (listA: Article[], listB: Article[]): Article[] => {
      const map = new Map<string, Article>();
      listB.forEach((item) => {
        if (item && item.id) map.set(item.id, item);
      });
      listA.forEach((item) => {
        if (item && item.id) map.set(item.id, item);
      });
      return Array.from(map.values()).sort((a, b) => {
        const dateA = new Date(a.publishedDate).getTime() || 0;
        const dateB = new Date(b.publishedDate).getTime() || 0;
        return dateB - dateA;
      });
    };

    // A. Parallel fetch from both Firestore and Server so all visitors see every published article
    Promise.allSettled([
      getArticlesFromFirestore(),
      fetch('/api/articles')
        .then((r) => r.json())
        .then((d) =>
          Array.isArray(d?.articles)
            ? d.articles.map((a: any) => formatDocToArticle(a.id, a))
            : []
        )
        .catch(() => [] as Article[]),
    ])
      .then(([firestoreRes, serverRes]) => {
        if (!isMounted) return;
        const firestoreList: Article[] =
          firestoreRes.status === 'fulfilled' && Array.isArray(firestoreRes.value)
            ? firestoreRes.value.map((a) => formatDocToArticle(a.id, a))
            : [];
        const serverList: Article[] =
          serverRes.status === 'fulfilled' && Array.isArray(serverRes.value)
            ? serverRes.value.map((a) => formatDocToArticle(a.id, a))
            : [];

        const combined = mergeArticles(firestoreList, serverList);
        if (combined.length > 0) {
          setArticles(combined);
          try {
            localStorage.setItem('rishu_articles', JSON.stringify(combined));
          } catch {}
        }
        setIsLoadingArticles(false);

        // Bi-directional Auto-Sync:
        // 1. If articles exist in Firestore but are missing from server, push to server
        if (firestoreList.length > 0) {
          firestoreList.forEach((fArt) => {
            if (!serverList.some((s) => s.id === fArt.id)) {
              fetch('/api/articles', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-admin-password': 'Password@123',
                },
                body: JSON.stringify({ article: fArt }),
              }).catch(() => {});
            }
          });
        }

        // 2. If articles exist on server but are missing from Firestore, push to Firestore
        if (serverList.length > 0) {
          serverList.forEach((sArt) => {
            if (!firestoreList.some((f) => f.id === sArt.id)) {
              saveArticleToFirestore(sArt).catch(() => {});
            }
          });
        }

        // 3. If articles are saved in local browser, sync them to both
        try {
          const savedLocal = localStorage.getItem('rishu_articles');
          if (savedLocal) {
            const parsed = JSON.parse(savedLocal);
            if (Array.isArray(parsed) && parsed.length > 0) {
              parsed.forEach((localArt: Article) => {
                const formatted = formatDocToArticle(localArt.id, localArt);
                if (!serverList.some((s) => s.id === formatted.id)) {
                  fetch('/api/articles', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-admin-password': 'Password@123',
                    },
                    body: JSON.stringify({ article: formatted }),
                  }).catch(() => {});
                }
                if (!firestoreList.some((f) => f.id === formatted.id)) {
                  saveArticleToFirestore(formatted).catch(() => {});
                }
              });
            }
          }
        } catch {}
      })
      .catch(() => {
        if (isMounted) setIsLoadingArticles(false);
      });

    // B. Real-time listener for Firestore articles
    const unsubscribeArticles = subscribeToArticles(
      (firestoreArticles) => {
        if (!isMounted) return;
        if (firestoreArticles && firestoreArticles.length > 0) {
          const formatted = firestoreArticles.map((a) => formatDocToArticle(a.id, a));
          setArticles((prev) => {
            const updated = mergeArticles(formatted, prev);
            try {
              localStorage.setItem('rishu_articles', JSON.stringify(updated));
            } catch {}
            return updated;
          });
        }
        setIsLoadingArticles(false);
      },
      (err) => {
        console.warn('Real-time articles listener warning:', err);
      }
    );

    // C. Author Profile sync
    getAuthorProfileFromFirestore()
      .then((savedProfile) => {
        if (isMounted && savedProfile) {
          setProfile((prev) => ({ ...prev, ...savedProfile }));
          try {
            localStorage.setItem('rishu_author_profile', JSON.stringify(savedProfile));
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
      unsubscribeArticles();
    };
  }, []);

  // 2b. Load categories from Firestore & sync in real-time
  useEffect(() => {
    let isMounted = true;

    getCategoriesFromFirestore()
      .then((cloudCats) => {
        if (!isMounted) return;
        if (cloudCats && cloudCats.length > 0) {
          setCategories(cloudCats);
          try {
            localStorage.setItem('rishu_categories', JSON.stringify(cloudCats));
          } catch {}
        } else {
          // If Firestore categories collection is empty, seed with initial categories
          seedInitialCategoriesIfEmpty(INITIAL_CATEGORIES).catch(() => {});
          // Check server API fallback
          fetch('/api/categories')
            .then((r) => r.json())
            .then((d) => {
              if (isMounted && d?.categories && Array.isArray(d.categories) && d.categories.length > 0) {
                setCategories(d.categories);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (!isMounted) return;
        fetch('/api/categories')
          .then((r) => r.json())
          .then((d) => {
            if (isMounted && d?.categories && Array.isArray(d.categories) && d.categories.length > 0) {
              setCategories(d.categories);
            }
          })
          .catch(() => {});
      });

    const unsubscribeCats = subscribeToCategories(
      (firestoreCats) => {
        if (!isMounted) return;
        if (firestoreCats && firestoreCats.length > 0) {
          setCategories(firestoreCats);
          try {
            localStorage.setItem('rishu_categories', JSON.stringify(firestoreCats));
          } catch {}
        }
      },
      (err) => {
        console.warn('Real-time categories listener warning:', err);
      }
    );

    return () => {
      isMounted = false;
      unsubscribeCats();
    };
  }, []);

  // 3. Messages listener for Admin
  useEffect(() => {
    if (isUserAdmin(currentUser)) {
      const unsubscribe = subscribeToMessages(
        (updatedMessages) => {
          setMessages(updatedMessages);
          try {
            localStorage.setItem('rishu_contact_messages', JSON.stringify(updatedMessages));
          } catch {}
        },
        (err) => {
          console.warn('Messages Firestore listener notice:', err);
        }
      );
      return () => unsubscribe();
    } else if (isAdminLoggedIn) {
      // Backend API fallback for password-based admin login
      const headers: Record<string, string> = {};
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      else headers['x-admin-password'] = 'Password@123';
      fetch('/api/messages', { headers })
        .then((r) => r.json())
        .then((data) => {
          if (data?.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
            try {
              localStorage.setItem('rishu_contact_messages', JSON.stringify(data.messages));
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [isAdminLoggedIn, currentUser, adminToken]);

  const handleAdminLoginSuccess = (token?: string, username?: string) => {
    if (token) {
      setAdminToken(token);
      try {
        localStorage.setItem('rishu_admin_token', token);
      } catch {}
    }
    if (username) {
      setAdminUsername(username);
      try {
        localStorage.setItem('rishu_admin_username', username);
      } catch {}
    }
  };

  const handleLogoutAdmin = async () => {
    try {
      await signOut(auth);
    } catch {}
    setAdminToken(null);
    setCurrentUser(null);
    setIsInboxOpen(false);
    setIsEditProfileOpen(false);
    setIsNewArticleOpen(false);
    setArticleToEdit(null);
    try {
      localStorage.removeItem('rishu_admin_token');
      localStorage.removeItem('rishu_admin_auth');
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

  // Safe handler to open new article modal
  const handleOpenNewArticleSafe = () => {
    if (isAdminLoggedIn) {
      setArticleToEdit(null);
      setIsNewArticleOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // Safe handlers to manage categories
  const handleOpenCategoriesManager = () => {
    setAuthModalTab('categories');
    setCategoryToEditInModal(null);
    setOpenAddCategoryInModal(false);
    setIsAuthModalOpen(true);
  };

  const handleOpenAddCategoryModal = () => {
    setAuthModalTab('categories');
    setCategoryToEditInModal(null);
    setOpenAddCategoryInModal(true);
    setIsAuthModalOpen(true);
  };

  const handleOpenEditCategoryModal = (cat: CategoryItem) => {
    setAuthModalTab('categories');
    setCategoryToEditInModal(cat);
    setOpenAddCategoryInModal(false);
    setIsAuthModalOpen(true);
  };

  // Handler for editing existing article (Admin only)
  const handleEditArticle = (article: Article) => {
    if (!isAdminLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setArticleToEdit(article);
    setIsNewArticleOpen(true);
  };

  // Profile update (Admin only) - Single consistent source of truth
  const handleUpdateProfile = async (updated: AuthorProfile) => {
    if (!isAdminLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    setProfile(updated);
    try {
      localStorage.setItem('rishu_author_profile', JSON.stringify(updated));
      localStorage.setItem('rishu_avatar', updated.avatar);
    } catch {}
    AUTHOR_RISHU.name = updated.name;
    AUTHOR_RISHU.role = updated.role;
    AUTHOR_RISHU.avatar = updated.avatar;

    // Immediately update articles in React state so all cards, hero, about, detail view reflect the new avatar
    setArticles((prev) => {
      const updatedArticles = prev.map((art) => ({
        ...art,
        author: {
          ...(art.author || {}),
          name: updated.name,
          role: updated.role,
          avatar: updated.avatar,
        },
      }));
      try {
        localStorage.setItem('rishu_articles', JSON.stringify(updatedArticles));
      } catch {}
      return updatedArticles;
    });

    if (selectedArticle) {
      setSelectedArticle((prev) =>
        prev
          ? {
              ...prev,
              author: {
                ...(prev.author || {}),
                name: updated.name,
                role: updated.role,
                avatar: updated.avatar,
              },
            }
          : null
      );
    }

    // Persist profile to Firestore
    try {
      await saveAuthorProfileToFirestore(updated);
    } catch (err) {
      console.error('Failed to persist profile to Firestore:', err);
    }

    // Cascade author avatar update to all existing articles in Firestore
    try {
      await updateArticlesAuthorAvatarInFirestore(updated.avatar, updated.name, updated.role);
    } catch (err) {
      console.warn('Article avatar cascade in Firestore notice:', err);
    }

    // Backend sync
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      else headers['x-admin-password'] = 'Password@123';
      await fetch('/api/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({ profile: updated }),
      });
      await fetch('/api/articles/sync-author', {
        method: 'POST',
        headers,
        body: JSON.stringify({ avatar: updated.avatar, name: updated.name, role: updated.role }),
      });
    } catch {}
  };

  const handleAvatarChange = (newAvatar: string) => {
    const updated = { ...profile, avatar: newAvatar };
    handleUpdateProfile(updated);
  };

  // ========================
  // CATEGORY MANAGEMENT HANDLERS (Admin Only)
  // ========================
  const handleAddCategory = async (newCategory: CategoryItem) => {
    if (!isAdminLoggedIn) throw new Error('Admin authentication required.');

    // Optimistically update state
    setCategories((prev) => {
      const filtered = prev.filter(
        (c) => c.id !== newCategory.id && c.name.toLowerCase() !== newCategory.name.toLowerCase()
      );
      const updated = [...filtered, newCategory];
      try {
        localStorage.setItem('rishu_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Write to Cloud Firestore
    try {
      await saveCategoryToFirestore(newCategory);
    } catch (err) {
      console.warn('Firestore category write notice:', err);
    }

    // Write to backend API
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      else headers['x-admin-password'] = 'Password@123';
      await fetch('/api/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify({ category: newCategory }),
      });
    } catch {}
  };

  const handleRenameCategory = async (
    categoryId: string,
    oldName: string,
    updatedCategory: CategoryItem
  ) => {
    if (!isAdminLoggedIn) throw new Error('Admin authentication required.');

    // 1. Update category in state
    setCategories((prev) => {
      const updated = prev.map((c) =>
        c.id === categoryId || c.name === oldName ? updatedCategory : c
      );
      try {
        localStorage.setItem('rishu_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Cascade rename to all matching articles in state
    setArticles((prev) => {
      const updated = prev.map((art) =>
        art.category === oldName ? { ...art, category: updatedCategory.name } : art
      );
      try {
        localStorage.setItem('rishu_articles', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (selectedArticle && selectedArticle.category === oldName) {
      setSelectedArticle((prev) => (prev ? { ...prev, category: updatedCategory.name } : null));
    }

    if (selectedCategory === oldName) {
      setSelectedCategory(updatedCategory.name);
    }

    // 3. Update Firestore with cascade
    try {
      await renameCategoryInFirestore(categoryId, oldName, updatedCategory);
    } catch (err) {
      console.warn('Firestore rename category notice:', err);
    }

    // 4. Update backend server
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      else headers['x-admin-password'] = 'Password@123';
      await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ category: updatedCategory, oldName }),
      });
    } catch {}
  };

  const handleDeleteCategory = async (
    categoryId: string,
    oldName: string,
    replacementName: string
  ) => {
    if (!isAdminLoggedIn) throw new Error('Admin authentication required.');

    // 1. Remove category from state
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== categoryId && c.name !== oldName);
      try {
        localStorage.setItem('rishu_categories', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Reassign affected articles in state
    if (replacementName) {
      setArticles((prev) => {
        const updated = prev.map((art) =>
          art.category === oldName ? { ...art, category: replacementName } : art
        );
        try {
          localStorage.setItem('rishu_articles', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      if (selectedArticle && selectedArticle.category === oldName) {
        setSelectedArticle((prev) => (prev ? { ...prev, category: replacementName } : null));
      }
    }

    if (selectedCategory === oldName) {
      setSelectedCategory('All');
    }

    // 3. Delete from Firestore with article reassignment
    try {
      await deleteCategoryWithReassignment(categoryId, oldName, replacementName);
    } catch (err) {
      console.warn('Firestore delete category notice:', err);
    }

    // 4. Delete from backend server
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      else headers['x-admin-password'] = 'Password@123';
      await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ replacementCategory: replacementName }),
      });
    } catch {}
  };

  // Contact message handler (Open for all visitors)
  const handleSendMessage = async (msgData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => {
    try {
      const created = await sendContactMessageToFirestore(msgData);
      setMessages((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Failed to submit message to Firestore:', err);
      // Local fallback
      const fallbackMsg: ContactMessage = {
        id: `msg-${Date.now()}`,
        ...msgData,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setMessages((prev) => [fallbackMsg, ...prev]);
    }
  };

  const handleMarkRead = async (id: string, read: boolean) => {
    if (!isAdminLoggedIn) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    try {
      await updateMessageReadStatusInFirestore(id, read);
    } catch {}
  };

  const handleMarkAllRead = async () => {
    if (!isAdminLoggedIn) return;
    setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
    for (const msg of messages) {
      if (!msg.read) {
        updateMessageReadStatusInFirestore(msg.id, true).catch(() => {});
      }
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!isAdminLoggedIn) return;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteMessageFromFirestore(id);
    } catch {}
  };

  const handleClearAllMessages = async () => {
    if (!isAdminLoggedIn) return;
    const current = [...messages];
    setMessages([]);
    for (const msg of current) {
      deleteMessageFromFirestore(msg.id).catch(() => {});
    }
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

  // Publish / Save article handler (Admin only, permanently saved to Firestore & Backend!)
  const handlePublishArticle = async (articleToSave: Article): Promise<void> => {
    if (!isAdminLoggedIn) {
      setIsAuthModalOpen(true);
      throw new Error('Admin authentication required.');
    }

    const finalCover = articleToSave.coverImage || PRESET_COVER_IMAGES[0].url;
    const finalTags =
      Array.isArray(articleToSave.tags) && articleToSave.tags.length > 0
        ? articleToSave.tags
        : ['Tech', 'Engineering'];

    const articleWithAuthor: Article = {
      ...articleToSave,
      publishedStatus: 'published',
      coverImage: finalCover,
      tags: finalTags,
      author: {
        name: profile.name || DEFAULT_AUTHOR_PROFILE.name,
        role: profile.role || DEFAULT_AUTHOR_PROFILE.role,
        avatar: profile.avatar || DEFAULT_AUTHOR_PROFILE.avatar,
      },
    };

    const formattedArticle = formatDocToArticle(articleWithAuthor.id, articleWithAuthor);

    // 1. Direct write to Cloud Firestore
    try {
      await saveArticleToFirestore(formattedArticle);
    } catch (err: any) {
      console.warn('Firestore write notice:', err);
    }

    // 2. Backup write to backend server
    try {
      const isEdit = articles.some((a) => a.id === formattedArticle.id);
      const endpoint = isEdit ? `/api/articles/${formattedArticle.id}` : '/api/articles';
      const method = isEdit ? 'PUT' : 'POST';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-admin-password': 'Password@123',
      };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;

      await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify({ article: formattedArticle }),
      });
    } catch (serverErr) {
      console.warn('Backend server backup write warning:', serverErr);
    }

    // 3. Update React state & local storage immediately
    setArticles((prev) => {
      const isEdit = prev.some((a) => a.id === formattedArticle.id);
      const updated = isEdit
        ? prev.map((a) => (a.id === formattedArticle.id ? formattedArticle : a))
        : [formattedArticle, ...prev];
      try {
        localStorage.setItem('rishu_articles', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (selectedArticle && selectedArticle.id === formattedArticle.id) {
      setSelectedArticle(formattedArticle);
    }

    setArticleToEdit(null);
  };

  // Delete article handler (Admin only, permanently removed from Firestore & Backend!)
  const handleDeleteArticle = async (id: string): Promise<void> => {
    if (!isAdminLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    // Delete from Firestore
    try {
      await deleteArticleFromFirestore(id);
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }

    // Delete from backend server
    try {
      const headers: Record<string, string> = {
        'x-admin-password': 'Password@123',
      };
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (err) {
      console.warn('Server delete notice:', err);
    }

    // Update state
    setArticles((prev) => {
      const updated = prev.filter((art) => art.id !== id);
      try {
        localStorage.setItem('rishu_articles', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Like article handler (Visitors can interact, synced to Firestore)
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

    incrementArticleLikesInFirestore(id);
  };

  // Bookmark toggle handler (Visitors can bookmark locally)
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

  // Compute category counts dynamically from active categories state
  const categoriesWithCounts: CategoryItem[] = categories.map((cat) => ({
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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200 relative overflow-x-hidden">
        {/* Navigation Bar */}
        <Navbar
          activeView={activeView}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewArticle={handleOpenNewArticleSafe}
          profile={profile}
          onEditProfile={handleOpenEditProfileSafe}
          isAdminLoggedIn={isAdminLoggedIn}
          unreadCount={unreadMessagesCount}
          onOpenInbox={handleOpenInboxSafe}
          onOpenAdminAuth={() => {
            setAuthModalTab('credentials');
            setCategoryToEditInModal(null);
            setOpenAddCategoryInModal(false);
            setIsAuthModalOpen(true);
          }}
          onLogoutAdmin={handleLogoutAdmin}
          onOpenCategories={handleOpenCategoriesManager}
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
              onDelete={isAdminLoggedIn ? handleDeleteArticle : undefined}
              onEdit={isAdminLoggedIn ? handleEditArticle : undefined}
              authorAvatar={profile.avatar}
            />
          ) : (
            /* Views depending on route */
            <>
              {/* Home View */}
              {activeView === 'home' && (
                <>
                  {/* Featured Article Section (only if articles exist) */}
                  {featuredArticle && (
                    <FeaturedArticle
                      article={featuredArticle}
                      onReadArticle={(art) => {
                        setSelectedArticle(art);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onLikeArticle={handleLikeArticle}
                      authorAvatar={profile.avatar}
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
                    onDeleteArticle={isAdminLoggedIn ? handleDeleteArticle : undefined}
                    onEditArticle={isAdminLoggedIn ? handleEditArticle : undefined}
                    onOpenNewArticle={isAdminLoggedIn ? () => { setArticleToEdit(null); setIsNewArticleOpen(true); } : undefined}
                    isAdminLoggedIn={isAdminLoggedIn}
                    isLoading={isLoadingArticles}
                    categories={categories}
                    authorAvatar={profile.avatar}
                  />

                  <CategoriesSection
                    categories={categoriesWithCounts}
                    onSelectCategory={(catName) => {
                      setSelectedCategory(catName);
                      setActiveView('articles');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    isAdminLoggedIn={isAdminLoggedIn}
                    onOpenAdminCategories={handleOpenCategoriesManager}
                    onAddCategory={handleOpenAddCategoryModal}
                    onEditCategory={handleOpenEditCategoryModal}
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
                    onDeleteArticle={isAdminLoggedIn ? handleDeleteArticle : undefined}
                    onEditArticle={isAdminLoggedIn ? handleEditArticle : undefined}
                    onOpenNewArticle={isAdminLoggedIn ? () => { setArticleToEdit(null); setIsNewArticleOpen(true); } : undefined}
                    isAdminLoggedIn={isAdminLoggedIn}
                    isLoading={isLoadingArticles}
                    categories={categories}
                    authorAvatar={profile.avatar}
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
                    isAdminLoggedIn={isAdminLoggedIn}
                    onOpenAdminCategories={handleOpenCategoriesManager}
                    onAddCategory={handleOpenAddCategoryModal}
                    onEditCategory={handleOpenEditCategoryModal}
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
          onOpenAdminAuth={() => {
            setAuthModalTab('credentials');
            setCategoryToEditInModal(null);
            setOpenAddCategoryInModal(false);
            setIsAuthModalOpen(true);
          }}
          onOpenCategories={handleOpenCategoriesManager}
          onLogoutAdmin={handleLogoutAdmin}
          onOpenNewArticle={handleOpenNewArticleSafe}
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

        {/* New / Edit Article Modal (Only accessible if logged in as Admin) */}
        {isAdminLoggedIn && (
          <NewArticleModal
            isOpen={isNewArticleOpen}
            onClose={() => {
              setIsNewArticleOpen(false);
              setArticleToEdit(null);
            }}
            onPublish={handlePublishArticle}
            articleToEdit={articleToEdit}
            categories={categories}
          />
        )}

        {/* Edit Profile Modal (Only accessible if logged in as Admin) */}
        {isAdminLoggedIn && (
          <EditProfileModal
            isOpen={isEditProfileOpen}
            onClose={() => setIsEditProfileOpen(false)}
            profile={profile}
            onSave={handleUpdateProfile}
          />
        )}

        {/* Admin Inbox Modal (Only accessible if logged in as Admin) */}
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

        {/* Admin Authentication & Credentials Modal */}
        <AdminAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setCategoryToEditInModal(null);
            setOpenAddCategoryInModal(false);
          }}
          onSuccess={handleAdminLoginSuccess}
          isLoggedIn={isAdminLoggedIn}
          onLogout={handleLogoutAdmin}
          onOpenInbox={() => setIsInboxOpen(true)}
          onOpenNewArticle={() => {
            setArticleToEdit(null);
            setIsNewArticleOpen(true);
          }}
          currentUser={currentUser}
          adminUsername={adminUsername}
          adminToken={adminToken}
          categories={categories}
          articles={articles}
          onAddCategory={handleAddCategory}
          onRenameCategory={handleRenameCategory}
          onDeleteCategory={handleDeleteCategory}
          initialTab={authModalTab}
          categoryToEdit={categoryToEditInModal}
          openAddCategory={openAddCategoryInModal}
        />
      </div>
    </ThemeProvider>
  );
}
