/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('controller', {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            state: {
                type: Sequelize.ENUM(['on', 'off', 'auto']),
                allowNull: false,
                defaultValue: 'auto'
            },
            gpio: {
                type: Sequelize.INTEGER,
                allowNull: true
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('controller');
    }
};