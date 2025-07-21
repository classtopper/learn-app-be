// cacheManger.js
const NodeCache = require('node-cache');
const path = require('path');
const fs = require('fs');
const Navbar = require('./models/navbar'); 
const Sidebar = require('./models/sidebar');  
const BodyContent = require('./models/bodyContent');  
const Quiz = require('./models/quiz');  
const Choice = require('./models/choice');  
const Question = require('./models/question');  
const Answer = require('./models/answer');  
const InterviewQuestion = require('./models/interviewQuestion');

// Read TTL value from environment variable or default to 86400 seconds
const cacheTTL = process.env.CACHE_TTL || 86400;

const cache = new NodeCache({ stdTTL: parseInt(cacheTTL, 10) });

const getCurrentTimestamp = () => {
    const now = new Date();
    return `${now.toISOString()} - `;
};

const refreshCache = async () => {
    console.log(`${getCurrentTimestamp()} Starting cache refresh...`);

    // Refresh navbars cache
    try {
        const navbars = await Navbar.findAll({
            attributes: ['id', 'title'], // Only select id and title
            order: [['id', 'ASC']] // Order navbars by id ascending
        });
        const plainNavbars = JSON.parse(JSON.stringify(navbars));
        cache.set('navbars_data', plainNavbars);
        console.log(`${getCurrentTimestamp()} Navbars cache refreshed.`);
    } catch (error) {
        console.error(`${getCurrentTimestamp()} Error refreshing navbars cache:`, error);
    }

     // Refresh sidebars cache
     try {
        const sidebars = await Sidebar.findAll({
            attributes: ['id', 'title', 'order', 'navbarId'], 
            order: [['id', 'ASC']]  
        });
        const plainSidebars = JSON.parse(JSON.stringify(sidebars));
        cache.set('sidebars_data', plainSidebars);
        console.log(`${getCurrentTimestamp()} Sidebars cache refreshed.`);
    } catch (error) {
        console.error(`${getCurrentTimestamp()} Error refreshing sidebars cache:`, error);
    }

    // Refresh bodycontents cache
    try {
        const bodyContents = await BodyContent.findAll({
            attributes: ['id', 'content', 'sidebarId'],
            order: [['id', 'ASC']]
        });
        const plainBodyContents = JSON.parse(JSON.stringify(bodyContents));
        cache.set('bodyContents_data', plainBodyContents);
        console.log(`${getCurrentTimestamp()} Bodycontents cache refreshed.`);
    } catch (error) {
        console.error(`${getCurrentTimestamp()} Error refreshing bodycontents cache:`, error);
    }

    // Refresh quiz cache
    try {
        const quiz = await Quiz.findAll({
            attributes: ['id', 'question', 'correctAnswer', 'navbarId'],
            order: [['id', 'ASC']]
        });
        const plainQuiz = JSON.parse(JSON.stringify(quiz));
        cache.set('quizzes_data', plainQuiz);
        console.log(`${getCurrentTimestamp()} Quiz cache refreshed.`);
    } catch (error) {
        console.error(`${getCurrentTimestamp()} Error refreshing quiz cache:`, error);
    }

     // Refresh choice cache
     try {
        const choice = await Choice.findAll({
            attributes: ['id', 'optionText', 'quizId'],
            order: [['id', 'ASC']]
        });
        const plainChoice = JSON.parse(JSON.stringify(choice));
        cache.set('choices_data', plainChoice);
        console.log(`${getCurrentTimestamp()} Choice cache refreshed.`);
    } catch (error) {
        console.error(`${getCurrentTimestamp()} Error refreshing choice cache:`, error);
    }

    // Refresh Question cache
    try {
        const questions = await Question.findAll({
            attributes: ['id', 'title'],
            order: [['id', 'ASC']]
        });
        const plainQuestions = JSON.parse(JSON.stringify(questions));
        cache.set('questions_data', plainQuestions);
        console.log(`${getCurrentTimestamp()} Questions cache refreshed.`);
    } catch (error) {
        console.error(`${getCurrentTimestamp()} Error refreshing questions cache:`, error);
    }

    // Refresh Answer cache
    try {
        const answers = await Answer.findAll({
            attributes: ['id', 'content', 'questionId'],
            order: [['id', 'ASC']]
        });
        const plainAnswers = JSON.parse(JSON.stringify(answers));
        cache.set('answers_data', plainAnswers);
        console.log(`${getCurrentTimestamp()} Answers cache refreshed.`);
    } catch (error) {
        console.error(`${getCurrentTimestamp()} Error refreshing Answers cache:`, error);
    }

    // Refresh InterviewQuestions cache
    try {
        const interviewQuestion = await InterviewQuestion.findAll({
            attributes: ['id', 'question', 'answer', 'navbarId'],
            order: [['id', 'ASC']]
        });
        const plainInterviewQuestions = JSON.parse(JSON.stringify(interviewQuestion));
        cache.set('interviewQuestions_data', plainInterviewQuestions);
        console.log(`${getCurrentTimestamp()} InterviewQuestion cache refreshed.`);
    } catch (error) {
        console.error(`${getCurrentTimestamp()} Error refreshing interview question cache:`, error);
    }

    // Refresh images cache
    try {
        const uploadDir = path.join(__dirname, 'uploads');
        fs.readdir(uploadDir, (err, files) => {
            if (err) {
                console.error(`${getCurrentTimestamp()} Error reading images directory:`, err);
                return;
            }
            const images = files.map(file => `/images/${file}`);
            cache.set('images_data', images);
            console.log(`${getCurrentTimestamp()} Images cache refreshed.`);
        });
    } catch (error) {
        console.error(`${getCurrentTimestamp()} Error refreshing images cache:`, error);
    }
};

// Initial cache population
const initializeCache = async () => {
    await refreshCache();
};

// Export cache and cache management functions
module.exports = {
    cache,
    refreshCache,
    initializeCache
};
