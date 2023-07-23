const { Sequelize, DataTypes } = require('sequelize');
const connection = require('../utils/getDBInstance');

const User = connection.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    avatar: {
        type: DataTypes.STRING,
        allowNull: null,
    },

});

module.exports = User;