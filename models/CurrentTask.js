const connection = require('../utils/getDBInstance');
const { Sequelize, DataTypes } = require('sequelize');

const Task = require('./Task');
const CurrentTask = connection.define('CurrentTask', {
    timeLeft: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});

Task.hasOne(CurrentTask, {
    onDelete: 'CASCADE',
});
CurrentTask.belongsTo(Task);

module.exports = CurrentTask;
