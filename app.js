require('dotenv').config();
const express = require('express');
const path = require('path');
const navbarRoutes = require('./routes/navbar');
const imageRoutes = require('./routes/image');
const sidebarRoutes = require('./routes/sidebar');
const bodyContentRoutes = require('./routes/bodyContent');
const quizRoutes = require('./routes/quiz');
const choiceRoutes = require('./routes/choice');
const questionRoutes = require('./routes/question');
const answerRoutes = require('./routes/answer');
const interviewQuestionRoutes = require('./routes/interviewQuestion');
const sequelize = require('./db');
const cors = require('cors');
const setCacheControl = require('./middleware/cacheControl');
const basicAuth = require('./middleware/auth');
const cron = require('node-cron');
const { cache, refreshCache, initializeCache } = require('./cacheManager');
const compression = require('compression');
const helmet = require('helmet');

const app = express();

// Schedule the cache refresh to run every 24 hours
cron.schedule('0 0 * * *', async () => {
    console.log('Scheduled cache refresh at', new Date());
    try {
        await refreshCache();
    } catch (error) {
        console.error('Error refreshing cache:', error);
    }
});

// Initial cache population on startup
initializeCache();

const corsOptions = {
  origin: ['https://alphatutor.org', 'http://localhost:3000'],  // allow both production and local dev
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],  // <== Add 'Cache-Control' here
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

app.use(compression());
app.use(express.json());
app.set('etag', 'strong');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// Serve static files from the "uploads" directory
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// Conditionally apply basicAuth only for non-GET requests
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }
  basicAuth(req, res, next);
});

// Helper to attach cache control and cache instance to routes
const attachCachedRoute = (routePath, router) => {
  app.use(routePath, setCacheControl(), (req, res, next) => {
    req.cache = cache;
    next();
  }, router);
};

attachCachedRoute('/api/navbars', navbarRoutes);
attachCachedRoute('/api/sidebars', sidebarRoutes);
attachCachedRoute('/api/bodyContents', bodyContentRoutes);
attachCachedRoute('/api/quizzes', quizRoutes);
attachCachedRoute('/api/choices', choiceRoutes);
attachCachedRoute('/api/questions', questionRoutes);
attachCachedRoute('/api/answers', answerRoutes);
attachCachedRoute('/api/interviewQuestions', interviewQuestionRoutes);
attachCachedRoute('/api/images', imageRoutes);

const PORT = process.env.PORT || 5001;

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log('Error: ' + err));
