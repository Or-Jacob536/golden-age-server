// File: server/models/restaurantMenu.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RestaurantMenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
    }
  }
  
  RestaurantMenu.init({
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true
    },
    menuXml: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'RestaurantMenu',
  });
  
  return RestaurantMenu;
};
