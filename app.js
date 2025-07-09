// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
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
const basicAuth = require('./middleware/auth');
const cron = require('node-cron');
const { cache, refreshCache, initializeCache } = require('./cacheManager');

const app = express();

// Schedule the cache refresh to run every 24 hours
// cron.schedule('* * * * *') to run every 1 hours
cron.schedule('0 0 * * *', async () => {
    console.log('Scheduled cache refresh at', new Date());
    await refreshCache();
});

// Initial cache population on startup
initializeCache();

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the "uploads" directory
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// Apply basicAuth middleware globally or to specific routes
app.use('/api', basicAuth);

// Pass cache instance to the routes
app.use('/api/navbars', (req, res, next) => {
    req.cache = cache;
    next();
}, navbarRoutes);

app.use('/api/sidebars', (req, res, next) => {
    req.cache = cache;
    next();
}, sidebarRoutes);

app.use('/api/bodyContents', (req, res, next) => {
    req.cache = cache;
    next();
}, bodyContentRoutes);

app.use('/api/quizzes', (req, res, next) => {
    req.cache = cache;
    next();
}, quizRoutes);

app.use('/api/choices', (req, res, next) => {
    req.cache = cache;
    next();
}, choiceRoutes);

app.use('/api/questions', (req, res, next) => {
    req.cache = cache;
    next();
}, questionRoutes);

app.use('/api/answers', (req, res, next) => {
    req.cache = cache;
    next();
}, answerRoutes);

app.use('/api/interviewQuestions', (req, res, next) => {
    req.cache = cache;
    next();
}, interviewQuestionRoutes);

app.use('/api/images', (req, res, next) => {
    req.cache = cache;
    next();
}, imageRoutes);


const PORT = process.env.PORT || 5000;

sequelize.authenticate().then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.log('Error: ' + err));
