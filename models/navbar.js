// models/navbar.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Navbar = sequelize.define('Navbar', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Navbar;
