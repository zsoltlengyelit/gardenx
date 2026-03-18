/** @type {import('sequelize-cli').Migration} */
const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(transaction => {
      return Promise.all([

        queryInterface.addColumn('controller', 'modbusChannel', {
          type: DataTypes.SMALLINT,
          allowNull: false,
        },
        { transaction }),

        queryInterface.removeColumn('controller', 'gpio', { transaction })
      ]);
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('controller', 'modbusChannel');
    await queryInterface.addColumn('controller', 'gpio', {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true
    });
  }
};
