/** @type {import('sequelize-cli').Migration} */
const {DataTypes} = require("sequelize");
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(transaction => {
            return Promise.all([
                queryInterface.createTable('controller', {
                    id: {
                        type: DataTypes.UUID,
                        allowNull: false,
                        primaryKey: true,
                    },
                    name: {
                        type: DataTypes.STRING,
                        allowNull: false,
                        unique: true
                    },
                    state: {
                        type: DataTypes.ENUM('on', 'off', 'auto'),
                        allowNull: false,
                        defaultValue: 'auto'
                    },
                    gpio: {
                        type: DataTypes.INTEGER,
                        allowNull: true,
                        unique: true
                    }
                }, {transaction}),

                queryInterface.createTable('schedule', {
                    id: {
                        type: DataTypes.UUID,
                        defaultValue: DataTypes.UUIDV4,
                        allowNull: false,
                        primaryKey: true
                    },
                    start: {
                        type: DataTypes.DATE,
                        allowNull: false
                    },
                    end: {
                        type: DataTypes.DATE,
                        allowNull: true
                    },
                    rrule: {
                        type: DataTypes.STRING,
                        allowNull: true
                    },
                    active: {
                        type: DataTypes.BOOLEAN,
                        allowNull: false,
                        defaultValue: true
                    },
                    controller_id: {
                        type: DataTypes.STRING,
                        references: {model: {tableName: 'controller'}, key: 'id'},
                        allowNull: false
                    }
                }, {transaction})
            ])
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('controller');
        await queryInterface.dropTable('schedule');
    }
};