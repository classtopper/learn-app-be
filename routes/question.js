// routes/question.js
const express = require('express');
const router = express.Router();
const Question = require('../models/question');

// Get all questions with caching
router.get('/', async (req, res, next) => {
    const cacheKey = 'questions_data';
    let cachedData = req.cache.get(cacheKey);
    if (cachedData) {
        return res.json(cachedData);
    }
    try {
        const questions = await Question.findAll({
            attributes: ['id', 'title'], // Only select id and title
            order: [['id', 'ASC']] // Order Questions by id ascending
        });
        // Cache only plain objects, JSON-parsed to ensure no cloning issues
        const plainQuestions = JSON.parse(JSON.stringify(questions));
        req.cache.set(cacheKey, plainQuestions);
        res.json(plainQuestions);
    } catch (error) {
        next(error);
    }
});

// Force recache of questions
router.post('/recache', async (req, res) => {
    const cacheKey = 'questions_data';
    try {
        const questions = await Question.findAll({
            attributes: ['id', 'title'], // Only select id and title
            order: [['id', 'ASC']] // Order questions by id ascending
        });

        // Cache only plain objects, JSON-parsed to ensure no cloning issues
        const plainQuestions = JSON.parse(JSON.stringify(questions));

        req.cache.set(cacheKey, plainQuestions);
        res.json({ message: 'Questions recached successfully' });
    } catch (error) {
        next(error);
    }
});

// Get a single question by id
router.get('/:id', async (req, res) => {
    const question = await Question.findByPk(req.params.id, {
        attributes: ['id', 'title']
    });
    res.json(question);
});

// Create a new question
router.post('/', async (req, res) => {
    const question = await Question.create(req.body);
    res.json(question);
});

// Update a question
router.put('/:id', async (req, res) => {
    const question = await Question.findByPk(req.params.id);
    question.update(req.body);
    res.json(question);
});

// Delete a question
router.delete('/:id', async (req, res) => {
    const question = await Question.findByPk(req.params.id);
    question.destroy();
    res.json({ message: 'Question deleted' });
});

module.exports = router;
