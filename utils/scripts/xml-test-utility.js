const fs = require('fs');
const path = require('path');
const { validateMenuXml, validatePoolHoursXml, validateGenericXml } = require('../utils/xmlValidator');

/**
 * Utility script to validate XML files
 * 
 * Usage: 
 *   node validateXmlFile.js <file_path> <type>
 * 
 * Where:
 *   - file_path: Path to the XML file to validate
 *   - type: Type of XML to validate ('menu', 'pool', or 'generic')
 * 
 * Examples:
 *   node validateXmlFile.js ./examples/menu-example.xml menu
 *   node validateXmlFile.js ./examples/pool-hours-example.xml pool
 */

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node validateXmlFile.js <file_path> [type]');
    console.error('Types: menu, pool, generic (default)');
    process.exit(1);
  }
  
  const filePath = args[0];
  const type = args[1] || 'generic';
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    
    // Read file content
    const xmlContent = fs.readFileSync(filePath, 'utf8');
    
    // Validate based on type
    let result;
    switch (type.toLowerCase()) {
      case 'menu':
        result = await validateMenuXml(xmlContent);
        break;
      case 'pool':
        result = await validatePoolHoursXml(xmlContent);
        break;
      case 'generic':
      default:
        result = await validateGenericXml(xmlContent);
        break;
    }
    
    // Output result
    console.log('Validation Result:');
    console.log('------------------');
    console.log(`Valid: ${result.isValid}`);
    console.log(`Message: ${result.message}`);
    
    if (result.isValid) {
      console.log('\nParsed Data Structure:');
      console.log('----------------------');
      console.log(JSON.stringify(result.data, null, 2));
    }
    
    process.exit(result.isValid ? 0 : 1);
  } 
  catch (error) {
    console.error('Validation error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
