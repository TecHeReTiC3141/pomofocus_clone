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
    },

    doneToday: {
        type: DataTypes.VIRTUAL,
        get() {
            const finishDate = new Date(this.finishTime);
            return finishDate.toDateString() === new Date().toDateString();
        }
    },

    doneYesterday: {
        type: DataTypes.VIRTUAL,
        get() {
            const finishDate = new Date(this.finishTime);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return finishDate.toDateString() === yesterday.toDateString();
        }
    },

    doneLast7Days: {
        type: DataTypes.VIRTUAL,
        get() {
            const weekAgo = new Date();
            weekAgo.setHours(0, 0, 0, 0);
            weekAgo.setDate(weekAgo.getDate() - 6);
            return this.doneToday || (weekAgo <= this.finishTime
                && this.finishTime <= Date.now());
        }
    },


});

User.hasMany(DoneTask, {
    onDelete: 'CASCADE',
});

DoneTask.belongsTo(User);

module.exports = DoneTask;