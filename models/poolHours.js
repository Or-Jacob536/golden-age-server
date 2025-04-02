// File: server/models/poolHours.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PoolHours extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
    }
  }
  
  PoolHours.init({
    hoursXml: {
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
    modelName: 'PoolHours',
  });
  
  return PoolHours;
};
