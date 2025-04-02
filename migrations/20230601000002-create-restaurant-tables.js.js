'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create restaurant menus table
    await queryInterface.createTable('RestaurantMenus', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        unique: true
      },
      menuXml: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      lastUpdated: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create restaurant hours table
    await queryInterface.createTable('RestaurantHours', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hoursJson: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      lastUpdated: {
        type: Sequelize.DATE,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('RestaurantMenus');
    await queryInterface.dropTable('RestaurantHours');
  }
};
