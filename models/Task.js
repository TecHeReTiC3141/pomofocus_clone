const { Sequelize, DataTypes } = require('sequelize');
const connection = require('../utils/getDBInstance');

const { User } = require('./User');

const Task = connection.define('Task', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue('name', value.trim());
        }
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

User.hasMany(Task, {
    onDelete: 'CASCADE',
});

Task.belongsTo(User);

module.exports = Task;