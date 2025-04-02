// File: server/utils/xmlValidator.js

const xml2js = require('xml2js');

/**
 * Utility to validate XML format and structure
 * 
 * This utility provides functions to validate different types of XML data
 * used throughout the application
 */

/**
 * Validates restaurant menu XML structure
 * @param {string} xmlString - Raw XML string to validate
 * @returns {Promise<{isValid: boolean, message: string, data: Object}>} - Validation result
 */
async function validateMenuXml(xmlString) {
  try {
    // Parse XML to check its basic structure
    const parser = new xml2js.Parser({ 
      explicitArray: false,
      mergeAttrs: false,
      attrkey: '$' 
    });
    
    const result = await parser.parseStringPromise(xmlString);
    
    // Check for required elements and attributes
    if (!result.menu) {
      return { 
        isValid: false, 
        message: "Missing root 'menu' element", 
        data: null 
      };
    }
    
    if (!result.menu.$ || !result.menu.$.date) {
      return { 
        isValid: false, 
        message: "Missing required 'date' attribute on menu element", 
        data: null 
      };
    }
    
    // Check date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(result.menu.$.date)) {
      return { 
        isValid: false, 
        message: "Date must be in YYYY-MM-DD format", 
        data: null 
      };
    }
    
    // Validate meals section exists
    if (!result.menu.meals) {
      return { 
        isValid: false, 
        message: "Missing 'meals' element", 
        data: null 
      };
    }
    
    // Success case
    return { 
      isValid: true, 
      message: "Valid menu XML", 
      data: result 
    };
  } 
  catch (error) {
    return { 
      isValid: false, 
      message: `XML parsing error: ${error.message}`, 
      data: null 
    };
  }
}

/**
 * Validates pool hours XML structure
 * @param {string} xmlString - Raw XML string to validate
 * @returns {Promise<{isValid: boolean, message: string, data: Object}>} - Validation result
 */
async function validatePoolHoursXml(xmlString) {
  try {
    // Parse XML to check its basic structure
    const parser = new xml2js.Parser({ 
      explicitArray: false,
      mergeAttrs: false,
      attrkey: '$' 
    });
    
    const result = await parser.parseStringPromise(xmlString);
    
    // Check for required elements and attributes
    if (!result.poolHours) {
      return { 
        isValid: false, 
        message: "Missing root 'poolHours' element", 
        data: null 
      };
    }
    
    if (!result.poolHours.$ || !result.poolHours.$.lastUpdated) {
      return { 
        isValid: false, 
        message: "Missing required 'lastUpdated' attribute on poolHours element", 
        data: null 
      };
    }
    
    // Check if weekdays and weekend sections exist
    if (!result.poolHours.weekdays || !result.poolHours.weekend) {
      return { 
        isValid: false, 
        message: "Missing required 'weekdays' or 'weekend' elements", 
        data: null 
      };
    }
    
    // Success case
    return { 
      isValid: true, 
      message: "Valid pool hours XML", 
      data: result 
    };
  } 
  catch (error) {
    return { 
      isValid: false, 
      message: `XML parsing error: ${error.message}`, 
      data: null 
    };
  }
}

/**
 * Generic XML validation function
 * @param {string} xmlString - Raw XML string to validate
 * @returns {Promise<{isValid: boolean, message: string, data: Object}>} - Validation result
 */
async function validateGenericXml(xmlString) {
  try {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlString);
    
    return { 
      isValid: true, 
      message: "Valid XML structure", 
      data: result 
    };
  } 
  catch (error) {
    return { 
      isValid: false, 
      message: `XML parsing error: ${error.message}`, 
      data: null 
    };
  }
}

module.exports = {
  validateMenuXml,
  validatePoolHoursXml,
  validateGenericXml
};
