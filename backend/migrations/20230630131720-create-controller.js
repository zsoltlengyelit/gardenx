/** @type {import('sequelize-cli').Migration} */
const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(transaction => {
      return Promise.all([

        queryInterface.addColumn('schedule', 'group_id', {
          type: DataTypes.STRING,
          allowNull: true,
        },
        { transaction })
      ]);
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('schedule', 'group_id');
  }
};
