// models/quiz.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Navbar = require('./navbar');  

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    question: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correctAnswer: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

Navbar.hasMany(Quiz, { foreignKey: 'navbarId' });
Quiz.belongsTo(Navbar, { foreignKey: 'navbarId' });

module.exports = Quiz;
