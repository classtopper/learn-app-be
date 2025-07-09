// routes/quiz.js

const express = require('express');
const router = express.Router();
const Quiz = require('../models/quiz');

// Get all quizzes (optionally filtered by navbarId) with caching
router.get('/', async (req, res) => {
    try {
        const { navbarId } = req.query;
        const cacheKey = 'quizzes_data'; 
        let cachedData = req.cache.get(cacheKey);

        if (!cachedData) {
            const quizzes = await Quiz.findAll({
                attributes: ['id', 'question', 'correctAnswer', 'navbarId'], 
                order: [['id', 'ASC']] 
            });

            cachedData = JSON.parse(JSON.stringify(quizzes));
            req.cache.set(cacheKey, cachedData);
        }

        let filteredData = cachedData;
        if (navbarId) {
            filteredData = cachedData.filter(item => item.navbarId == navbarId);
        }

        res.json(filteredData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Force recache of Quizzes
router.post('/recache', async (req, res) => {
    const cacheKey = 'quizzes_data';
    try {
        const quizzes = await Quiz.findAll({
            attributes: ['id', 'question', 'correctAnswer', 'navbarId'], 
            order: [['id', 'ASC']]  
        });

        cachedData = JSON.parse(JSON.stringify(quizzes));
        req.cache.set(cacheKey, cachedData);
        res.json({ message: 'Quizzes recached successfully' });
    } catch (error) {
        next(error);
    }
});

// Create a quiz
router.post('/', async (req, res) => {
    try {
        const quiz = await Quiz.create(req.body);
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a quiz
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await Quiz.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedQuiz = await Quiz.findOne({ where: { id: req.params.id } });
            res.status(200).json(updatedQuiz);
        } else {
            res.status(404).json({ error: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a quiz
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Quiz.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
