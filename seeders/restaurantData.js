const fs = require("fs");
const path = require("path");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Read sample XML and JSON files
    const menuXml = fs.readFileSync(
      path.join(__dirname, "../examples/menuExample.xml"),
      "utf8"
    );

    const hoursJson = fs.readFileSync(
      path.join(__dirname, "../examples/restaurantHoursExample.json"),
      "utf8"
    );

    // Create sample restaurant data
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayFormatted = today.toISOString().split("T")[0];
    const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

    // Insert menu data for today and tomorrow
    await queryInterface.bulkInsert("RestaurantMenus", [
      {
        date: todayFormatted,
        menuXml: menuXml.replace("2023-06-01", todayFormatted),
        lastUpdated: now,
        createdAt: now,
        updatedAt: now,
      },
      {
        date: tomorrowFormatted,
        menuXml: menuXml.replace("2023-06-01", tomorrowFormatted),
        lastUpdated: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Insert restaurant hours
    return queryInterface.bulkInsert("RestaurantHours", [
      {
        hoursJson: hoursJson,
        lastUpdated: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("RestaurantMenus", null, {});
    return queryInterface.bulkDelete("RestaurantHours", null, {});
  },
};
