// routes/interviewQuestions.js
const express = require('express');
const InterviewQuestion = require('../models/interviewQuestion');
const router = express.Router();

// Get all interview questions (optionally filtered by navbarId) with caching
router.get('/', async (req, res) => {
    try {
        const { navbarId } = req.query;
        const cacheKey = 'interviewQuestions_data'; 
        let cachedData = req.cache.get(cacheKey);

        if (!cachedData) {
            // Fetch interview questions from the database
            const interviewQuestions = await InterviewQuestion.findAll({
                attributes: ['id', 'question', 'answer', 'navbarId'],
                order: [['id', 'ASC']]
            });

            // Cache the data
            cachedData = JSON.parse(JSON.stringify(interviewQuestions));
            req.cache.set(cacheKey, cachedData);
        }
        
        // Filter cached data if navbarId is provided
        let filteredData = cachedData;
        if (navbarId) {
            filteredData = cachedData.filter(item => item.navbarId == navbarId);
        }

        res.json(filteredData);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Force recache of interview questions
router.post('/recache', async (req, res) => {
    const cacheKey = 'interviewQuestions_data';
    try {
        // Fetch interview questions from the database
        const interviewQuestions = await InterviewQuestion.findAll({
            attributes: ['id', 'question', 'answer', 'navbarId'],
            order: [['id', 'ASC']]
        });

        // Cache the data
        const cachedData = JSON.parse(JSON.stringify(interviewQuestions));
        req.cache.set(cacheKey, cachedData);
        res.json({ message: 'Interview questions recached successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create an interview question
router.post('/', async (req, res) => {
    try {
        const interviewQuestion = await InterviewQuestion.create(req.body);
        res.status(201).json(interviewQuestion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an interview question
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await InterviewQuestion.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedQuiz = await InterviewQuestion.findOne({ where: { id: req.params.id } });
            res.status(200).json(updatedQuiz);
        } else {
            res.status(404).json({ error: 'InterviewQuestion not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete an interview question
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await InterviewQuestion.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'InterviewQuestion not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
