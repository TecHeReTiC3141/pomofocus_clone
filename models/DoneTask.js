const { Sequelize, DataTypes } = require('sequelize');
const connection = require('../utils/getDBInstance');

const { User } = require('./User');

const DoneTask = connection.define('DoneTask', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    finishTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

User.hasMany(DoneTask, {
    onDelete: 'CASCADE',
});

DoneTask.belongsTo(User);

module.exports = DoneTask;