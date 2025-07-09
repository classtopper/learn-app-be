// models/choice.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Quiz = require('./quiz');

const Choice = sequelize.define('Choice', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    optionText: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

Quiz.hasMany(Choice, { foreignKey: 'quizId' });
Choice.belongsTo(Quiz, { foreignKey: 'quizId' });

module.exports = Choice;
