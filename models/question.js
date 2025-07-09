// models/question.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Question;
