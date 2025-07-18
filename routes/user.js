// routes/userAuth.js
const express = require('express');
const User = require('../models/user');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Signup or Signin
router.post('/auth', async (req, res) => {
    try {
        const { email, password, country } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email, password, and country are required' 
            });
        }

        // Check if user exists
        let user = await User.findOne({ where: { email } });

        if (user) {
            // Sign in
            const isValid = await user.validPassword(password);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            // Sign up
            user = await User.create({ email, password, country });
        }

        // Create JWT token (24 hours expiration)
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                country: user.country
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return username and token
        res.json({
            token,
            username: user.getUsername()
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Token verification endpoint
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        
        if (!token) {
            return res.status(401).json({ valid: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Optionally check if user still exists in DB
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ valid: false, error: 'User not found' });
        }

        res.json({ 
            valid: true,
            username: user.getUsername()
        });
    } catch (error) {
        res.status(401).json({ valid: false, error: 'Invalid token' });
    }
});


// Get all users (optionally filtered by userId) 
router.get('/', async (req, res) => {
    try {
        const { email } = req.query;

        // Base query configuration
        const queryOptions = {
            attributes: ['id', 'email', 'country', 'createdAt'],
            order: [['id', 'ASC']]
        };

        // If email parameter exists, add where clause
        if (email) {
            queryOptions.where = { email };
        }

        const users = await User.findAll(queryOptions);

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/', async (req, res) => {
    try {
        // Extract token from Authorization header
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        // Delete the user
        const deleted = await User.destroy({ where: { email: email } });

        if (!deleted) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/forgot-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password with the new one (hashed)
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;