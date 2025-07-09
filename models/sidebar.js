// models/navbar.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Navbar = require('./navbar');

const Sidebar = sequelize.define('Sidebar', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

Navbar.hasMany(Sidebar, { foreignKey: 'navbarId' });
Sidebar.belongsTo(Navbar, { foreignKey: 'navbarId' });

module.exports = Sidebar;
