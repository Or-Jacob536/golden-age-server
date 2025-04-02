const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Generate password hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const now = new Date();

    // Create sample users
    return queryInterface.bulkInsert("Users", [
      {
        firstName: "משה",
        lastName: "כהן",
        email: "moshe@example.com",
        password: passwordHash,
        phoneNumber: "0501234567",
        role: "resident",
        languagePreference: "he",
        darkMode: false,
        fontSize: "medium",
        createdAt: now,
        updatedAt: now,
      },
      {
        firstName: "שרה",
        lastName: "לוי",
        email: "sarah@example.com",
        password: passwordHash,
        phoneNumber: "0521234567",
        role: "resident",
        languagePreference: "he",
        darkMode: true,
        fontSize: "large",
        createdAt: now,
        updatedAt: now,
      },
      {
        firstName: "דוד",
        lastName: "ישראלי",
        email: "david@example.com",
        password: passwordHash,
        phoneNumber: "0541234567",
        role: "staff",
        languagePreference: "he",
        darkMode: false,
        fontSize: "medium",
        createdAt: now,
        updatedAt: now,
      },
      {
        firstName: "רותי",
        lastName: "גולן",
        email: "ruth@example.com",
        password: passwordHash,
        phoneNumber: "0551234567",
        role: "admin",
        languagePreference: "en",
        darkMode: false,
        fontSize: "medium",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  },
};
