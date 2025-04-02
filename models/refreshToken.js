// File: server/models/refreshToken.js
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      this.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  
  RefreshToken.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    token: {
      type: DataTypes.STRING(1024),
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'RefreshToken',
    hooks: {
      beforeUpdate: async (token) => {
        // Set revoked timestamp when token is revoked
        if (token.changed('isRevoked') && token.isRevoked) {
          token.revokedAt = new Date();
        }
      }
    }
  });
  
  return RefreshToken;
};
