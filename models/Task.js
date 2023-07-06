const { Sequelize, DataTypes } = require('sequelize');
const connection = require('../utils/getDBInstance');

const Task = connection.define('Task', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    pomosDone: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },

    pomosNeed: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    description: {
        type: DataTypes.STRING,
        allowNull: true,
    }
})

module.exports = Task;