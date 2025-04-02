const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index.js` file will call this method automatically.
   */
  class RestaurantHours extends Model {
    static associate(models) {
      // Define associations here
    }
  }

  RestaurantHours.init(
    {
      hoursJson: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "RestaurantHours",
    }
  );

  return RestaurantHours;
};
