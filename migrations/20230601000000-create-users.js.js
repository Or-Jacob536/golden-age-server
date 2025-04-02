'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'resident'
      },
      languagePreference: {
        type: Sequelize.STRING(5),
        allowNull: false,
        defaultValue: 'he'
      },
      darkMode: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      fontSize: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'medium'
      },
      resetPasswordToken: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      resetPasswordExpire: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.dropTable('Users');
  }
};
