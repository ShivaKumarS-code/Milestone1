/* const express = require('express');
const fs = require('fs').promises;
const path = require('path');

class ArticleSearchService {
  constructor() {
    this.dataStore = [];
    this.searchIndex = { terms: {}, labels: {} };
    this.currentId = 1;
    this.STORAGE_PATH = path.join(__dirname, 'articles-data.json');
  }

  computeRelevance(article, terms) {
    let score = 0;
    const fullText = (article.title + ' ' + article.body).toLowerCase();

    terms.forEach(term => {
      const occurrences = (fullText.match(new RegExp(term.toLowerCase(), 'g')) || []).length;
      score += occurrences;
    });

    return score;
  }

  updateSearchIndex(article) {
    const allTerms = (article.title + ' ' + article.body).toLowerCase().split(/\s+/);
    allTerms.forEach(term => {
      if (!this.searchIndex.terms[term]) this.searchIndex.terms[term] = [];
      this.searchIndex.terms[term].push(article.id);
    });

    article.tags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      if (!this.searchIndex.labels[lowerTag]) this.searchIndex.labels[lowerTag] = [];
      this.searchIndex.labels[lowerTag].push(article.id);
    });
  }

  createArticle(title, body, tags = []) {
    const newArticle = {
      id: this.currentId++,
      title,
      body,
      tags,
      timestamp: new Date().toISOString(),
    };

    this.dataStore.push(newArticle);
    this.updateSearchIndex(newArticle);
    this.saveArticles();
    return newArticle;
  }

  findArticles(query, order = 'relevance') {
    const terms = query.toLowerCase().split(/\s+/);
    const matchedIds = new Set();

    terms.forEach(term => {
      const matches = (this.searchIndex.terms[term] || []).concat(this.searchIndex.labels[term] || []);
      matches.forEach(id => matchedIds.add(id));
    });

    let results = this.dataStore
      .filter(article => matchedIds.has(article.id))
      .map(article => ({
        ...article,
        relevance: this.computeRelevance(article, terms),
      }));

    if (order === 'relevance') {
      results.sort((a, b) => b.relevance - a.relevance);
    } else if (order === 'date') {
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return results;
  }

  retrieveArticle(id) {
    return this.dataStore.find(article => article.id === parseInt(id, 10));
  }

  async saveArticles() {
    try {
      await fs.writeFile(this.STORAGE_PATH, JSON.stringify(this.dataStore, null, 2));
    } catch (err) {
      console.error('Failed to save articles:', err);
    }
  }

  async loadArticles() {
    try {
      const fileContent = await fs.readFile(this.STORAGE_PATH, 'utf-8');
      this.dataStore = JSON.parse(fileContent);
      this.currentId = Math.max(...this.dataStore.map(a => a.id)) + 1;

      this.searchIndex = { terms: {}, labels: {} };
      this.dataStore.forEach(article => this.updateSearchIndex(article));
    } catch (err) {
      console.log('No saved articles found.');
    }
  }
}

const app = express();
const searchService = new ArticleSearchService();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Article Search API',
    availableEndpoints: [
      { method: 'POST', path: '/articles', description: 'Create a new article' },
      { method: 'GET', path: '/articles/search', description: 'Search articles by query' },
      { method: 'GET', path: '/articles/:id', description: 'Retrieve article by ID' },
    ],
  });
});

app.post('/articles', (req, res) => {
  const { title, body, tags } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Both title and body are required.' });
  }

  const newArticle = searchService.createArticle(title, body, tags);
  res.status(201).json(newArticle);
});

app.get('/articles/search', (req, res) => {
  const { q: query, sort = 'relevance' } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  const results = searchService.findArticles(query, sort);
  res.json(results);
});

app.get('/articles/:id', (req, res) => {
  const article = searchService.retrieveArticle(parseInt(req.params.id, 10));

  if (!article) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  res.json(article);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await searchService.loadArticles();
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error('Failed to initialize server:', err);
  }
});
 */

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

class ArticleSearchService {
  constructor() {
    this.dataStore = [];
    this.searchIndex = { terms: {}, labels: {} };
    this.currentId = 1;
    this.STORAGE_PATH = path.join(__dirname, 'articles-data.json');
  }

  computeRelevance(article, terms) {
    let score = 0;
    const fullText = (article.title + ' ' + article.body).toLowerCase();

    terms.forEach(term => {
      const occurrences = (fullText.match(new RegExp(term.toLowerCase(), 'g')) || []).length;
      score += occurrences;
    });

    return score;
  }

  updateSearchIndex(article) {
    const allTerms = (article.title + ' ' + article.body).toLowerCase().split(/\s+/);
    allTerms.forEach(term => {
      if (!this.searchIndex.terms[term]) this.searchIndex.terms[term] = [];
      this.searchIndex.terms[term].push(article.id);
    });

    article.tags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      if (!this.searchIndex.labels[lowerTag]) this.searchIndex.labels[lowerTag] = [];
      this.searchIndex.labels[lowerTag].push(article.id);
    });
  }

  createArticle(id, title, body, tags = []) {
    // If ID is provided, use it, else auto-generate one
    const articleId = id || this.currentId++;

    // Prevent duplicates by checking if the ID already exists
    if (this.dataStore.some(article => article.id === articleId)) {
      return { error: "ID already exists." };
    }

    const newArticle = {
      id: articleId,  // Use provided id or auto-generate
      title,
      body,
      tags,
      timestamp: new Date().toISOString(),
    };

    this.dataStore.push(newArticle);
    this.updateSearchIndex(newArticle);
    this.saveArticles();
    return newArticle;
  }

  findArticles(query, order = 'relevance') {
    const terms = query.toLowerCase().split(/\s+/);
    const matchedIds = new Set();

    terms.forEach(term => {
      const matches = (this.searchIndex.terms[term] || []).concat(this.searchIndex.labels[term] || []);
      matches.forEach(id => matchedIds.add(id));
    });

    let results = this.dataStore
      .filter(article => matchedIds.has(article.id))
      .map(article => ({
        ...article,
        relevance: this.computeRelevance(article, terms),
      }));

    if (order === 'relevance') {
      results.sort((a, b) => b.relevance - a.relevance);
    } else if (order === 'date') {
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    return results;
  }

  retrieveArticle(id) {
    return this.dataStore.find(article => article.id === parseInt(id, 10));
  }

  async saveArticles() {
    try {
      await fs.writeFile(this.STORAGE_PATH, JSON.stringify(this.dataStore, null, 2));
    } catch (err) {
      console.error('Failed to save articles:', err);
    }
  }

  async loadArticles() {
    try {
      const fileContent = await fs.readFile(this.STORAGE_PATH, 'utf-8');
      this.dataStore = JSON.parse(fileContent);
      this.currentId = Math.max(...this.dataStore.map(a => a.id)) + 1;

      this.searchIndex = { terms: {}, labels: {} };
      this.dataStore.forEach(article => this.updateSearchIndex(article));
    } catch (err) {
      console.log('No saved articles found.');
    }
  }
}

const app = express();
const searchService = new ArticleSearchService();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Article Search API',
    availableEndpoints: [
      { method: 'POST', path: '/articles', description: 'Create a new article' },
      { method: 'GET', path: '/articles/search', description: 'Search articles by query' },
      { method: 'GET', path: '/articles/:id', description: 'Retrieve article by ID' },
    ],
  });
});

app.post('/articles', (req, res) => {
  const { id, title, body, tags } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Both title and body are required.' });
  }

  const newArticle = searchService.createArticle(id, title, body, tags);
  
  if (newArticle.error) {
    return res.status(400).json(newArticle);  
  }

  res.status(201).json(newArticle);
});

app.get('/articles/search', (req, res) => {
  const { q: query, sort = 'relevance' } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  const results = searchService.findArticles(query, sort);
  res.json(results);
});

app.get('/articles/:id', (req, res) => {
  const article = searchService.retrieveArticle(parseInt(req.params.id, 10));

  if (!article) {
    return res.status(404).json({ error: 'Article not found.' });
  }

  res.json(article);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await searchService.loadArticles();
    console.log(`Server is running on port ${PORT}`);
  } catch (err) {
    console.error('Failed to initialize server:', err);
  }
});
