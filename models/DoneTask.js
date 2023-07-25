const { Sequelize, DataTypes } = require('sequelize');
const connection = require('../utils/getDBInstance');

const { User } = require('./User');

const DoneTask = connection.define('DoneTask', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue('name', value.trim());
        }
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    finishTime: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    duration: {
        type: DataTypes.VIRTUAL,
        get() {
            return Math.round((this.finishTime - this.startTime) / (60 * 1000));
        }
    }
});

User.hasMany(DoneTask, {
    onDelete: 'CASCADE',
});

DoneTask.belongsTo(User);

module.exports = DoneTask;