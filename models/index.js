const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/database")[env];
const db = {};

// Create Sequelize instance
let sequelize;
try {
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else {
    sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );
  }
  
  // Test the connection
  sequelize.authenticate()
    .then(() => {
      console.log(`✅ Database connection successfully established (${env} environment)`);
    })
    .catch(err => {
      console.error('❌ Unable to connect to the database:', err.message);
    });
} catch (error) {
  console.error('❌ Database configuration error:', error.message);
  process.exit(1);
}

// Import all models in the directory
try {
  fs.readdirSync(__dirname)
    .filter((file) => {
      return (
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
      );
    })
    .forEach((file) => {
      try {
        const model = require(path.join(__dirname, file))(
          sequelize,
          Sequelize.DataTypes
        );
        db[model.name] = model;
        console.log(`✅ Model loaded: ${model.name}`);
      } catch (modelError) {
        console.error(`❌ Error loading model from ${file}:`, modelError.message);
      }
    });
  
  // Set up model associations
  Object.keys(db).forEach((modelName) => {
    try {
      if (db[modelName].associate) {
        db[modelName].associate(db);
        console.log(`✅ Associations established for: ${modelName}`);
      }
    } catch (associationError) {
      console.error(`❌ Error setting up associations for ${modelName}:`, associationError.message);
    }
  });
  
  console.log(`✅ Successfully loaded ${Object.keys(db).length - 2} models`); // Subtract sequelize and Sequelize
} catch (fsError) {
  console.error('❌ Error reading model directory:', fsError.message);
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Handle unexpected errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = db;