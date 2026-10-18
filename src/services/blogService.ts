import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import {
  db,
  ADMIN_EMAIL,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { Article, AuthorProfile, ContactMessage, CategoryItem } from '../types/blog';
import { DEFAULT_AUTHOR_PROFILE, INITIAL_CATEGORIES } from '../data/articles';

const ARTICLES_COLLECTION = 'articles';
const MESSAGES_COLLECTION = 'messages';
const PROFILE_COLLECTION = 'profile';
const CATEGORIES_COLLECTION = 'categories';
const PROFILE_DOC_ID = 'rishu';

// Helper to format Firestore raw data to Article
function formatDocToArticle(id: string, data: any): Article {
  const contentVal =
    typeof data.content === 'object' && data.content !== null
      ? data.content
      : {
          intro: typeof data.content === 'string' ? data.content : '',
          sections: [],
          conclusion: '',
        };

  return {
    id: data.id || id,
    slug: data.slug || id,
    title: data.title || '',
    shortDescription: data.shortDescription || '',
    content: contentVal,
    category: data.category || 'AI & Machine Learning',
    readingTime: data.readingTime || data.readTime || '5 min read',
    publishedDate: data.publishedDate || '',
    publishedStatus: data.publishedStatus || 'published',
    coverImage: data.coverImage || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    likes: typeof data.likes === 'number' ? data.likes : 0,
    featured: Boolean(data.featured),
    author: data.author || {
      name: DEFAULT_AUTHOR_PROFILE.name,
      role: DEFAULT_AUTHOR_PROFILE.role,
      avatar: DEFAULT_AUTHOR_PROFILE.avatar,
    },
  };
}

// ========================
// ARTICLES
// ========================
// One-time fetch for immediate page loads / SSR / direct rendering
export async function getArticlesFromFirestore(): Promise<Article[]> {
  const colRef = collection(db, ARTICLES_COLLECTION);
  try {
    const snapshot = await getDocs(colRef);
    const articles: Article[] = [];
    snapshot.forEach((docSnap) => {
      articles.push(formatDocToArticle(docSnap.id, docSnap.data()));
    });
    articles.sort((a, b) => {
      const dateA = new Date(a.publishedDate).getTime() || 0;
      const dateB = new Date(b.publishedDate).getTime() || 0;
      return dateB - dateA;
    });
    return articles;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, ARTICLES_COLLECTION);
  }
}

// Real-time synchronization
export function subscribeToArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (error: Error) => void
) {
  const q = collection(db, ARTICLES_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const articles: Article[] = [];
      snapshot.forEach((docSnap) => {
        articles.push(formatDocToArticle(docSnap.id, docSnap.data()));
      });
      articles.sort((a, b) => {
        const dateA = new Date(a.publishedDate).getTime() || 0;
        const dateB = new Date(b.publishedDate).getTime() || 0;
        return dateB - dateA;
      });
      onUpdate(articles);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, ARTICLES_COLLECTION);
      onError?.(err as Error);
    }
  );
}

export async function saveArticleToFirestore(article: Article): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, article.id);
  const payload = {
    id: article.id,
    slug: article.slug || article.id,
    title: article.title,
    shortDescription: article.shortDescription,
    content: article.content,
    coverImage: article.coverImage,
    author: article.author || {
      name: DEFAULT_AUTHOR_PROFILE.name,
      role: DEFAULT_AUTHOR_PROFILE.role,
      avatar: DEFAULT_AUTHOR_PROFILE.avatar,
    },
    category: article.category,
    publishedDate: article.publishedDate,
    publishedStatus: article.publishedStatus || 'published',
    readingTime: article.readingTime || '5 min read',
    featured: Boolean(article.featured),
    tags: Array.isArray(article.tags) ? article.tags : [],
    likes: typeof article.likes === 'number' ? article.likes : 0,
    authorEmail: ADMIN_EMAIL,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${ARTICLES_COLLECTION}/${article.id}`);
  }
}

export async function deleteArticleFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${ARTICLES_COLLECTION}/${id}`);
  }
}

export async function incrementArticleLikesInFirestore(id: string): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, id);
  try {
    await updateDoc(docRef, {
      likes: increment(1),
    });
  } catch (err) {
    console.error('Failed to increment like on Firestore, falling back locally', err);
  }
}

// ========================
// AUTHOR PROFILE
// ========================
export async function getAuthorProfileFromFirestore(): Promise<AuthorProfile | null> {
  const docRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AuthorProfile;
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch profile from Firestore, using default profile', err);
    return null;
  }
}

export async function saveAuthorProfileToFirestore(profile: AuthorProfile): Promise<void> {
  const docRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID);
  const payload = {
    ...profile,
    authorEmail: ADMIN_EMAIL,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${PROFILE_COLLECTION}/${PROFILE_DOC_ID}`);
  }
}

// ========================
// MESSAGES (Contact Form & Admin Inbox)
// ========================
export async function sendContactMessageToFirestore(msg: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newMsg: ContactMessage = {
    id,
    name: msg.name,
    email: msg.email,
    subject: msg.subject,
    message: msg.message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const docRef = doc(db, MESSAGES_COLLECTION, id);
  try {
    await setDoc(docRef, newMsg);
    return newMsg;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${MESSAGES_COLLECTION}/${id}`);
  }
}

export function subscribeToMessages(
  onUpdate: (messages: ContactMessage[]) => void,
  onError?: (error: Error) => void
) {
  const q = collection(db, MESSAGES_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const messages: ContactMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        messages.push({
          id: data.id || docSnap.id,
          name: data.name || '',
          email: data.email || '',
          subject: data.subject || '',
          message: data.message || '',
          createdAt: data.createdAt || new Date().toISOString(),
          read: Boolean(data.read),
        });
      });
      messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(messages);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, MESSAGES_COLLECTION);
      onError?.(err as Error);
    }
  );
}

export async function deleteMessageFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, id);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${MESSAGES_COLLECTION}/${id}`);
  }
}

export async function updateMessageReadStatusInFirestore(id: string, read: boolean): Promise<void> {
  const docRef = doc(db, MESSAGES_COLLECTION, id);
  try {
    await updateDoc(docRef, { read });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${MESSAGES_COLLECTION}/${id}`);
  }
}

// ========================
// CATEGORIES (Admin-only Managed Taxonomy)
// ========================
function formatDocToCategory(id: string, data: any): CategoryItem {
  return {
    id: data.id || id,
    name: data.name || 'General',
    slug: data.slug || id,
    description: data.description || '',
    iconName: data.iconName || 'Code',
    articleCount: typeof data.articleCount === 'number' ? data.articleCount : 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    authorEmail: data.authorEmail || ADMIN_EMAIL,
  };
}

export async function getCategoriesFromFirestore(): Promise<CategoryItem[]> {
  const colRef = collection(db, CATEGORIES_COLLECTION);
  try {
    const snapshot = await getDocs(colRef);
    const categories: CategoryItem[] = [];
    snapshot.forEach((docSnap) => {
      categories.push(formatDocToCategory(docSnap.id, docSnap.data()));
    });
    return categories;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, CATEGORIES_COLLECTION);
    return [];
  }
}

export function subscribeToCategories(
  onUpdate: (categories: CategoryItem[]) => void,
  onError?: (error: Error) => void
) {
  const q = collection(db, CATEGORIES_COLLECTION);
  return onSnapshot(
    q,
    (snapshot) => {
      const categories: CategoryItem[] = [];
      snapshot.forEach((docSnap) => {
        categories.push(formatDocToCategory(docSnap.id, docSnap.data()));
      });
      onUpdate(categories);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, CATEGORIES_COLLECTION);
      onError?.(err as Error);
    }
  );
}

export async function saveCategoryToFirestore(category: CategoryItem): Promise<void> {
  const cleanId = (category.slug || category.id || `cat-${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  const docRef = doc(db, CATEGORIES_COLLECTION, cleanId);
  const payload = {
    id: cleanId,
    name: category.name.trim(),
    slug: cleanId,
    description: (category.description || '').trim(),
    iconName: category.iconName || 'Code',
    authorEmail: ADMIN_EMAIL,
    updatedAt: new Date().toISOString(),
    createdAt: category.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${CATEGORIES_COLLECTION}/${cleanId}`);
  }
}

export async function renameCategoryInFirestore(
  categoryId: string,
  oldCategoryName: string,
  updatedCategory: CategoryItem
): Promise<void> {
  // 1. Update the Category document in Firestore
  await saveCategoryToFirestore(updatedCategory);

  // 2. Cascade rename across all articles that reference oldCategoryName
  try {
    const articlesCol = collection(db, ARTICLES_COLLECTION);
    const articlesSnap = await getDocs(articlesCol);
    const updatePromises: Promise<void>[] = [];

    articlesSnap.forEach((articleDoc) => {
      const articleData = articleDoc.data();
      if (articleData.category === oldCategoryName) {
        updatePromises.push(
          updateDoc(doc(db, ARTICLES_COLLECTION, articleDoc.id), {
            category: updatedCategory.name.trim(),
            updatedAt: new Date().toISOString(),
          })
        );
      }
    });

    await Promise.all(updatePromises);
  } catch (err) {
    console.error('Cascade update for renamed category failed on some articles:', err);
  }
}

export async function deleteCategoryWithReassignment(
  categoryIdToDelete: string,
  categoryNameToDelete: string,
  replacementCategoryName: string
): Promise<void> {
  // 1. Reassign affected articles to replacement category
  try {
    const articlesCol = collection(db, ARTICLES_COLLECTION);
    const articlesSnap = await getDocs(articlesCol);
    const updatePromises: Promise<void>[] = [];

    articlesSnap.forEach((articleDoc) => {
      const articleData = articleDoc.data();
      if (articleData.category === categoryNameToDelete) {
        updatePromises.push(
          updateDoc(doc(db, ARTICLES_COLLECTION, articleDoc.id), {
            category: replacementCategoryName.trim(),
            updatedAt: new Date().toISOString(),
          })
        );
      }
    });

    await Promise.all(updatePromises);
  } catch (err) {
    console.error('Error reassigning articles during category deletion:', err);
  }

  // 2. Delete the category document
  const docRef = doc(db, CATEGORIES_COLLECTION, categoryIdToDelete);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${CATEGORIES_COLLECTION}/${categoryIdToDelete}`);
  }
}

export async function seedInitialCategoriesIfEmpty(categories: CategoryItem[] = INITIAL_CATEGORIES): Promise<void> {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const cat of categories) {
        await saveCategoryToFirestore(cat);
      }
    }
  } catch (err) {
    console.warn('Initial categories seed skipped or encountered permission notice:', err);
  }
}

// ========================
// AUTHOR PROFILE AVATAR CASCADE
// ========================
export async function updateArticlesAuthorAvatarInFirestore(
  newAvatar: string,
  authorName?: string,
  authorRole?: string
): Promise<number> {
  try {
    const articlesCol = collection(db, ARTICLES_COLLECTION);
    const snap = await getDocs(articlesCol);
    let updatedCount = 0;
    const promises: Promise<void>[] = [];

    snap.forEach((articleDoc) => {
      const existing = articleDoc.data();
      const currentAuthor = existing.author || {};
      promises.push(
        updateDoc(doc(db, ARTICLES_COLLECTION, articleDoc.id), {
          author: {
            ...currentAuthor,
            name: authorName || currentAuthor.name || DEFAULT_AUTHOR_PROFILE.name,
            role: authorRole || currentAuthor.role || DEFAULT_AUTHOR_PROFILE.role,
            avatar: newAvatar,
          },
          updatedAt: new Date().toISOString(),
        }).then(() => {
          updatedCount++;
        })
      );
    });

    await Promise.all(promises);
    return updatedCount;
  } catch (err) {
    console.warn('Could not cascade avatar update to all Firestore articles:', err);
    return 0;
  }
}

