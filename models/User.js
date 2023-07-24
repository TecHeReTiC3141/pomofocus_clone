const { Sequelize, DataTypes } = require('sequelize');
const connection = require('../utils/getDBInstance');

const defaultUserSettings = {
    pomoTime: 25,
    shortBreakTime: 5,
    longBreakTime: 10,
    longBreakInterval: 3,
    darkMode: true,
}

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
        allowNull: true,
    },

    settings: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: JSON.stringify(defaultUserSettings),
    },
});

module.exports = { User, defaultUserSettings };