// File: server/models/user.js
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index.js` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      this.hasMany(models.RefreshToken, { foreignKey: 'userId' });
    }
  }
  
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'First name is required' },
        len: { args: [2, 50], msg: 'First name must be between 2 and 50 characters' }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Last name is required' },
        len: { args: [2, 50], msg: 'Last name must be between 2 and 50 characters' }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Email is required' },
        isEmail: { msg: 'Invalid email format' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: { args: [6, 128], msg: 'Password must be at least 6 characters' }
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Phone number is required' },
        is: {
          args: /^(\+?\d{1,3}[- ]?)?\d{9,10}$/,
          msg: 'Invalid phone number format'
        }
      }
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'resident',
      validate: {
        isIn: {
          args: [['resident', 'staff', 'admin']],
          msg: 'Role must be resident, staff, or admin'
        }
      }
    },
    languagePreference: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'he',
      validate: {
        isIn: {
          args: [['he', 'en']],
          msg: 'Language must be he or en'
        }
      }
    },
    darkMode: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    fontSize: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: {
          args: [['small', 'medium', 'large', 'extraLarge']],
          msg: 'Font size must be small, medium, large, or extraLarge'
        }
      }
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      // Hash password before saving
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  
  return User;
};
