// models/interviewQuestions.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Navbar = require('./navbar');  

const InterviewQuestion = sequelize.define('InterviewQuestion', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    question: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    answer: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    navbarId: {
        type: DataTypes.INTEGER,
        references: {
            model: Navbar, 
            key: 'id'
        }
    }
});

InterviewQuestion.belongsTo(Navbar, { foreignKey: 'navbarId' });

module.exports = InterviewQuestion;
