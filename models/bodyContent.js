const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Sidebar = require('./sidebar');

const BodyContent = sequelize.define('BodyContent', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

Sidebar.hasMany(BodyContent, { foreignKey: 'sidebarId' });
BodyContent.belongsTo(Sidebar, { foreignKey: 'sidebarId' });

module.exports = BodyContent;
