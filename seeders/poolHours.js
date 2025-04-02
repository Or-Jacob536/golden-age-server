const fs = require('fs');
const path = require('path');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // Read sample XML file
    const poolHoursXml = fs.readFileSync(
      path.join(__dirname, '../examples/pool-hours-example.xml'),
      'utf8'
    );
    
    // Insert pool hours
    return queryInterface.bulkInsert('PoolHours', [
      {
        hoursXml: poolHoursXml,
        lastUpdated: now,
        createdAt: now,
        updatedAt: now
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('PoolHours', null, {});
  }
};
