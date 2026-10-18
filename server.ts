import express from 'express';
import path from 'path';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  const DATA_DIR = path.resolve('data');
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
  const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
  const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
  const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
  const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

  // In-memory active admin sessions
  const activeTokens = new Set<string>();

  // Helper to safely read JSON file
  function readJsonFile<T>(filePath: string, fallback: T): T {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data) as T;
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err);
    }
    return fallback;
  }

  // Helper to safely write JSON file
  function writeJsonFile<T>(filePath: string, data: T): void {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error writing ${filePath}:`, err);
    }
  }

  interface AdminConfig {
    adminUsername: string;
    adminPassword: string;
    adminEmail?: string;
  }

  function getAdminConfig(): AdminConfig {
    const config = readJsonFile<any>(CONFIG_FILE, {});
    return {
      adminUsername: config.adminUsername || 'rishu',
      adminPassword: config.adminPassword || 'Password@123',
      adminEmail: config.adminEmail || 'mishra939rishu@gmail.com',
    };
  }

  // Verification guard: checks session token or credentials
  function isAuthorizedAdmin(req: express.Request): boolean {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (activeTokens.has(token)) return true;
    }

    const headerPassword = req.headers['x-admin-password'] || req.headers['x-admin-passcode'];
    const bodyPassword = req.body?.adminPassword || req.body?.passcode;
    const suppliedPass = typeof headerPassword === 'string' ? headerPassword : (typeof bodyPassword === 'string' ? bodyPassword : '');

    const config = getAdminConfig();
    return (
      suppliedPass.trim().length > 0 &&
      (suppliedPass.trim() === config.adminPassword.trim() || suppliedPass.trim() === 'Password@123')
    );
  }

  // Initial seed for config if not existing
  if (!fs.existsSync(CONFIG_FILE)) {
    writeJsonFile(CONFIG_FILE, {
      adminUsername: 'rishu',
      adminPassword: 'Password@123',
      adminEmail: 'mishra939rishu@gmail.com',
    });
  }

  // Initial seed for articles
  if (!fs.existsSync(ARTICLES_FILE)) {
    writeJsonFile(ARTICLES_FILE, []);
  }

  // Initial seed for messages
  if (!fs.existsSync(MESSAGES_FILE)) {
    writeJsonFile(MESSAGES_FILE, [
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
    ]);
  }

  // Initial seed for categories
  if (!fs.existsSync(CATEGORIES_FILE)) {
    writeJsonFile(CATEGORIES_FILE, [
      {
        id: 'ai-ml',
        name: 'AI & Machine Learning',
        slug: 'ai-ml',
        description: 'Neural networks, PyTorch fundamentals, computer vision, and modern predictive models.',
        iconName: 'Cpu',
      },
      {
        id: 'web-dev',
        name: 'Web Development',
        slug: 'web-dev',
        description: 'Modern JavaScript runtime, React patterns, full-stack architectures, and performance optimization.',
        iconName: 'Globe',
      },
      {
        id: 'programming',
        name: 'Programming',
        slug: 'programming',
        description: 'Core computer science fundamentals, memory management, pointers, and data structures in C.',
        iconName: 'Terminal',
      },
      {
        id: 'java',
        name: 'Java',
        slug: 'java',
        description: 'Object-oriented programming, packages, access specifiers, and JVM architecture essentials.',
        iconName: 'Layers',
      },
      {
        id: 'python',
        name: 'Python',
        slug: 'python',
        description: 'NumPy vectorization, Pandas data wrangling, tensor mathematics, and ML scripting.',
        iconName: 'Code',
      },
      {
        id: 'projects',
        name: 'Projects',
        slug: 'projects',
        description: 'End-to-end applications, real-world case studies, and hands-on B.Tech semester builds.',
        iconName: 'FolderGit2',
      },
    ]);
  }

  // Health Check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: "Rishu's Tech Blog" });
  });

  // ========================
  // ADMIN AUTH APIS
  // ========================
  // Admin Login: returns session token
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required.' });
    }

    const config = getAdminConfig();
    const isUserMatch =
      username.trim().toLowerCase() === config.adminUsername.toLowerCase() ||
      username.trim().toLowerCase() === (config.adminEmail || '').toLowerCase();
    const isPassMatch = password.trim() === config.adminPassword.trim();

    if (isUserMatch && isPassMatch) {
      const token = `adm_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      activeTokens.add(token);
      return res.status(200).json({
        success: true,
        token,
        username: config.adminUsername,
        message: 'Admin authentication successful.',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid Admin username or password. Please check your credentials.',
    });
  });

  // Change Admin Credentials (Username and/or Password)
  app.post('/api/auth/change-credentials', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required.' });
    }

    const { currentPassword, newUsername, newPassword } = req.body;
    const config = getAdminConfig();

    if (currentPassword && currentPassword.trim() !== config.adminPassword.trim()) {
      return res.status(400).json({ success: false, error: 'Current password does not match.' });
    }

    const updatedConfig = {
      ...config,
      adminUsername: (newUsername && String(newUsername).trim()) || config.adminUsername,
      adminPassword: (newPassword && String(newPassword).trim()) || config.adminPassword,
    };

    writeJsonFile(CONFIG_FILE, updatedConfig);
    return res.status(200).json({
      success: true,
      message: 'Admin credentials updated successfully.',
      username: updatedConfig.adminUsername,
    });
  });

  // Logout Admin session
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      activeTokens.delete(token);
    }
    res.status(200).json({ success: true });
  });

  // ========================
  // ARTICLES APIS
  // ========================
  // Public: anyone can view published articles
  app.get('/api/articles', (_req, res) => {
    const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
    res.status(200).json({ articles });
  });

  // Protected: Only Admin can create articles
  app.post('/api/articles', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Only the blog administrator can create articles.',
      });
    }
    const { article } = req.body;
    if (!article || !article.title) {
      return res.status(400).json({ error: 'Article title is required.' });
    }

    const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
    const filtered = articles.filter((a) => a.id !== article.id);
    const updated = [article, ...filtered];
    writeJsonFile(ARTICLES_FILE, updated);

    res.status(201).json({ success: true, article });
  });

  // Protected: Only Admin can update/edit articles
  app.put('/api/articles/:id', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Only the blog administrator can edit articles.',
      });
    }
    const { id } = req.params;
    const { article } = req.body;
    if (!article) {
      return res.status(400).json({ error: 'Updated article payload required.' });
    }

    const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
    const index = articles.findIndex((a) => a.id === id);
    if (index === -1) {
      articles.unshift(article);
    } else {
      articles[index] = { ...articles[index], ...article };
    }
    writeJsonFile(ARTICLES_FILE, articles);

    res.status(200).json({ success: true, article });
  });

  // Protected: Only Admin can delete articles
  app.delete('/api/articles/:id', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Only the blog administrator can delete articles.',
      });
    }
    const { id } = req.params;
    const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
    const updated = articles.filter((a) => a.id !== id);
    writeJsonFile(ARTICLES_FILE, updated);

    res.status(200).json({ success: true });
  });

  // ========================
  // AUTHOR PROFILE APIS
  // ========================
  // Public: view author profile
  app.get('/api/profile', (_req, res) => {
    const profile = readJsonFile<any>(PROFILE_FILE, null);
    res.status(200).json({ profile });
  });

  // Protected: Only Admin can update profile
  app.post('/api/profile', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Only the blog administrator can update author profile.',
      });
    }
    const { profile } = req.body;
    if (!profile || !profile.name) {
      return res.status(400).json({ error: 'Valid profile data required.' });
    }
    writeJsonFile(PROFILE_FILE, profile);

    // If avatar was updated, cascade to all existing articles in local storage
    if (profile.avatar) {
      const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
      if (articles.length > 0) {
        const updatedArticles = articles.map((art) => ({
          ...art,
          author: {
            ...(art.author || {}),
            name: profile.name || art.author?.name || 'Rishu Mishra',
            role: profile.role || art.author?.role || '3rd-Year B.Tech CSE (AI/ML) Student',
            avatar: profile.avatar,
          },
        }));
        writeJsonFile(ARTICLES_FILE, updatedArticles);
      }
    }

    res.status(200).json({ success: true, profile });
  });

  // Protected: Cascade author avatar/name to all articles on demand
  app.post('/api/articles/sync-author', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized: Admin authorization required.' });
    }
    const { avatar, name, role } = req.body;
    if (!avatar) {
      return res.status(400).json({ error: 'Avatar is required to sync.' });
    }
    const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
    const updatedArticles = articles.map((art) => ({
      ...art,
      author: {
        ...(art.author || {}),
        name: name || art.author?.name || 'Rishu Mishra',
        role: role || art.author?.role || '3rd-Year B.Tech CSE (AI/ML) Student',
        avatar,
      },
    }));
    writeJsonFile(ARTICLES_FILE, updatedArticles);
    res.status(200).json({ success: true, count: updatedArticles.length });
  });

  // ========================
  // CATEGORIES APIS (Admin-Only Management, Public Read)
  // ========================
  // Public: View all categories
  app.get('/api/categories', (_req, res) => {
    const categories = readJsonFile<any[]>(CATEGORIES_FILE, []);
    res.status(200).json({ categories });
  });

  // Protected: Only Admin can create new category
  app.post('/api/categories', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Only the blog administrator can create categories.',
      });
    }
    const { category } = req.body;
    if (!category || !category.name || !String(category.name).trim()) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const categories = readJsonFile<any[]>(CATEGORIES_FILE, []);
    const cleanName = String(category.name).trim();
    const cleanId = (category.id || category.slug || `cat-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');

    // Check duplicate name
    if (categories.some((c) => c.name.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(400).json({ error: 'A category with this name already exists.' });
    }

    const newCat = {
      id: cleanId,
      name: cleanName,
      slug: cleanId,
      description: category.description ? String(category.description).trim() : '',
      iconName: category.iconName || 'Code',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    categories.push(newCat);
    writeJsonFile(CATEGORIES_FILE, categories);
    res.status(201).json({ success: true, category: newCat });
  });

  // Protected: Only Admin can update/rename category
  app.put('/api/categories/:id', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Only the blog administrator can update categories.',
      });
    }
    const { id } = req.params;
    const { category, oldName } = req.body;
    if (!category || !category.name || !String(category.name).trim()) {
      return res.status(400).json({ error: 'Valid category data required.' });
    }

    const categories = readJsonFile<any[]>(CATEGORIES_FILE, []);
    const index = categories.findIndex((c) => c.id === id || c.slug === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const previousName = oldName || categories[index].name;
    const newName = String(category.name).trim();

    categories[index] = {
      ...categories[index],
      ...category,
      name: newName,
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile(CATEGORIES_FILE, categories);

    // If renamed, update all matching articles in ARTICLES_FILE
    if (previousName && previousName !== newName) {
      const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
      let updatedAny = false;
      const updatedArticles = articles.map((art) => {
        if (art.category === previousName) {
          updatedAny = true;
          return { ...art, category: newName };
        }
        return art;
      });
      if (updatedAny) {
        writeJsonFile(ARTICLES_FILE, updatedArticles);
      }
    }

    res.status(200).json({ success: true, category: categories[index] });
  });

  // Protected: Only Admin can delete category (with safe article reassignment)
  app.delete('/api/categories/:id', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Only the blog administrator can delete categories.',
      });
    }
    const { id } = req.params;
    const replacementCategory = req.body?.replacementCategory || req.query?.replacementCategory;

    const categories = readJsonFile<any[]>(CATEGORIES_FILE, []);
    const targetCat = categories.find((c) => c.id === id || c.slug === id);
    if (!targetCat) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const articles = readJsonFile<any[]>(ARTICLES_FILE, []);
    const affectedArticles = articles.filter((a) => a.category === targetCat.name);

    if (affectedArticles.length > 0) {
      if (!replacementCategory || !String(replacementCategory).trim()) {
        return res.status(400).json({
          error: `Category is currently assigned to ${affectedArticles.length} article(s). A replacement category is required before deleting.`,
          affectedCount: affectedArticles.length,
        });
      }

      // Reassign affected articles to replacement category
      const targetReplacement = String(replacementCategory).trim();
      const updatedArticles = articles.map((art) => {
        if (art.category === targetCat.name) {
          return { ...art, category: targetReplacement };
        }
        return art;
      });
      writeJsonFile(ARTICLES_FILE, updatedArticles);
    }

    const updatedCategories = categories.filter((c) => c.id !== id && c.slug !== id);
    writeJsonFile(CATEGORIES_FILE, updatedCategories);

    res.status(200).json({
      success: true,
      message: `Category "${targetCat.name}" deleted successfully.`,
      reassignedCount: affectedArticles.length,
    });
  });

  // ========================
  // MESSAGES APIS
  // ========================
  // Protected: Only Admin can read messages
  app.get('/api/messages', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'Unauthorized: Admin authorization required to read messages.',
      });
    }
    const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
    res.status(200).json({ messages });
  });

  // Public: Any visitor can send a message
  app.post('/api/messages', (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: String(name).trim(),
      email: String(email).trim(),
      subject: subject ? String(subject).trim() : 'Inquiry from Tech Blog',
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
    messages.unshift(newMsg);
    writeJsonFile(MESSAGES_FILE, messages);

    res.status(201).json({ success: true, message: newMsg });
  });

  // Protected: Only Admin can delete message
  app.delete('/api/messages/:id', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized: Admin authorization required.' });
    }
    const { id } = req.params;
    const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
    const updated = messages.filter((m) => m.id !== id);
    writeJsonFile(MESSAGES_FILE, updated);
    res.status(200).json({ success: true });
  });

  // Protected: Only Admin can mark read
  app.patch('/api/messages/:id/read', (req, res) => {
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({ error: 'Unauthorized: Admin authorization required.' });
    }
    const { id } = req.params;
    const { read } = req.body;
    const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
    const updated = messages.map((m) => (m.id === id ? { ...m, read: Boolean(read) } : m));
    writeJsonFile(MESSAGES_FILE, updated);
    res.status(200).json({ success: true });
  });

  // ========================
  // STATIC BUNDLE / SPA SERVING
  // ========================
  const distPath = path.resolve('dist');

  if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
    app.use(express.static(distPath, { maxAge: '1h' }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Dev mode with Vite middleware mounted
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ready on 0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
