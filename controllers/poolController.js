const xml2js = require("xml2js");
const asyncHandler = require("../middleware/asyncHandler");
const { PoolHours } = require("../models");
const AppError = require("../utils/appError");

/**
 * @desc    Get pool hours
 * @route   GET /api/pool/hours
 * @access  Public
 */
exports.getPoolHours = asyncHandler(async (req, res) => {
  // Get the most recent pool hours
  const hoursRecord = await PoolHours.findOne({
    order: [["lastUpdated", "DESC"]],
  });

  if (!hoursRecord) {
    throw new AppError("Pool hours not found", 404, "NOT_FOUND");
  }

  // Parse the XML string to JSON
  try {
    const parser = new xml2js.Parser({ 
      explicitArray: false,
      mergeAttrs: false,
      attrkey: '$'
    });
    const poolHoursData = await parser.parseStringPromise(hoursRecord.hoursXml);
    
    // Transform data for client if needed
    const transformedData = transformPoolHoursData(poolHoursData);
    
    res.json(transformedData);
  } catch (error) {
    console.error("XML parsing error:", error);
    throw new AppError("Error parsing pool hours data", 500, "DATA_ERROR");
  }
});

/**
 * @desc    Update pool hours
 * @route   PUT /api/pool/hours
 * @access  Private (Admin/Staff)
 */
exports.updatePoolHours = asyncHandler(async (req, res) => {
  // Check if XML was provided
  if (!req.body || !req.body.poolHours) {
    throw new AppError("No pool hours XML provided", 400, "VALIDATION_ERROR");
  }
  
  let xmlString;
  
  // Case 1: If the request has been processed by xmlParserMiddleware
  if (req.body.poolHours) {
    // Convert XML object back to string for storage
    const builder = new xml2js.Builder();
    xmlString = builder.buildObject(req.body);
  } 
  // Case 2: If raw XML is provided directly
  else if (req.rawXml) {
    xmlString = req.rawXml;
  }
  // Neither case is true
  else {
    throw new AppError("Invalid pool hours data format", 400, "VALIDATION_ERROR");
  }

  try {
    // Create a new pool hours record
    const hoursRecord = await PoolHours.create({
      hoursXml: xmlString,
      lastUpdated: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Pool hours updated successfully",
      id: hoursRecord.id,
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new AppError("Failed to save pool hours to database", 500, "DATABASE_ERROR");
  }
});

/**
 * @desc    Add special hours for a specific date
 * @route   POST /api/pool/hours/special
 * @access  Private (Admin/Staff)
 */
exports.addSpecialHours = asyncHandler(async (req, res) => {
  // Validate request body
  if (!req.body.date || !req.body.hours) {
    throw new AppError("Date and hours are required", 400, "VALIDATION_ERROR");
  }

  // Get the most recent pool hours
  const hoursRecord = await PoolHours.findOne({
    order: [["lastUpdated", "DESC"]],
  });

  if (!hoursRecord) {
    throw new AppError("Pool hours not found", 404, "NOT_FOUND");
  }

  try {
    // Parse the existing XML
    const parser = new xml2js.Parser({ 
      explicitArray: false,
      mergeAttrs: false,
      attrkey: '$'
    });
    const poolHoursData = await parser.parseStringPromise(hoursRecord.hoursXml);
    
    // Ensure the structure exists
    if (!poolHoursData.poolHours) {
      throw new AppError("Invalid pool hours data structure", 500, "DATA_ERROR");
    }
    
    // Initialize specialHours if it doesn't exist
    if (!poolHoursData.poolHours.specialHours) {
      poolHoursData.poolHours.specialHours = {};
    }
    
    // Initialize day array if it doesn't exist or convert single item to array
    if (!poolHoursData.poolHours.specialHours.day) {
      poolHoursData.poolHours.specialHours.day = [];
    } else if (!Array.isArray(poolHoursData.poolHours.specialHours.day)) {
      poolHoursData.poolHours.specialHours.day = [poolHoursData.poolHours.specialHours.day];
    }
    
    // Check if this date already exists
    const existingDayIndex = poolHoursData.poolHours.specialHours.day.findIndex(
      day => day.$ && day.$.date === req.body.date
    );
    
    // Create the new special day entry
    const newDay = {
      $: {
        date: req.body.date,
        hours: req.body.hours,
        reason: req.body.reason || ""
      }
    };
    
    // Update or add the special day
    if (existingDayIndex >= 0) {
      poolHoursData.poolHours.specialHours.day[existingDayIndex] = newDay;
    } else {
      poolHoursData.poolHours.specialHours.day.push(newDay);
    }
    
    // Update the lastUpdated attribute
    poolHoursData.poolHours.$.lastUpdated = new Date().toISOString();
    
    // Convert back to XML string
    const builder = new xml2js.Builder();
    const xmlString = builder.buildObject(poolHoursData);
    
    // Save to database
    const newHoursRecord = await PoolHours.create({
      hoursXml: xmlString,
      lastUpdated: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Special hours added/updated for ${req.body.date}`,
      date: req.body.date,
      hours: req.body.hours,
      reason: req.body.reason || ""
    });
  } catch (error) {
    console.error("Error updating special hours:", error);
    throw new AppError("Failed to update special hours", 500, "DATA_ERROR");
  }
});

/**
 * @desc    Remove special hours for a specific date
 * @route   DELETE /api/pool/hours/special/:date
 * @access  Private (Admin/Staff)
 */
exports.removeSpecialHours = asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  if (!date) {
    throw new AppError("Date parameter is required", 400, "VALIDATION_ERROR");
  }

  // Get the most recent pool hours
  const hoursRecord = await PoolHours.findOne({
    order: [["lastUpdated", "DESC"]],
  });

  if (!hoursRecord) {
    throw new AppError("Pool hours not found", 404, "NOT_FOUND");
  }

  try {
    // Parse the existing XML
    const parser = new xml2js.Parser({ 
      explicitArray: false,
      mergeAttrs: false,
      attrkey: '$'
    });
    const poolHoursData = await parser.parseStringPromise(hoursRecord.hoursXml);
    
    // Check if specialHours and day exist
    if (!poolHoursData.poolHours || 
        !poolHoursData.poolHours.specialHours || 
        !poolHoursData.poolHours.specialHours.day) {
      throw new AppError("No special hours found", 404, "NOT_FOUND");
    }
    
    // Ensure day is an array
    if (!Array.isArray(poolHoursData.poolHours.specialHours.day)) {
      poolHoursData.poolHours.specialHours.day = [poolHoursData.poolHours.specialHours.day];
    }
    
    // Find the index of the day to remove
    const dayIndex = poolHoursData.poolHours.specialHours.day.findIndex(
      day => day.$ && day.$.date === date
    );
    
    if (dayIndex === -1) {
      throw new AppError(`No special hours found for date ${date}`, 404, "NOT_FOUND");
    }
    
    // Remove the day
    poolHoursData.poolHours.specialHours.day.splice(dayIndex, 1);
    
    // If no days left, set empty array
    if (poolHoursData.poolHours.specialHours.day.length === 0) {
      poolHoursData.poolHours.specialHours.day = [];
    }
    
    // Update the lastUpdated attribute
    poolHoursData.poolHours.$.lastUpdated = new Date().toISOString();
    
    // Convert back to XML string
    const builder = new xml2js.Builder();
    const xmlString = builder.buildObject(poolHoursData);
    
    // Save to database
    const newHoursRecord = await PoolHours.create({
      hoursXml: xmlString,
      lastUpdated: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Special hours removed for ${date}`,
      date: date
    });
  } catch (error) {
    console.error("Error removing special hours:", error);
    throw new AppError(`Failed to remove special hours: ${error.message}`, 500, "DATA_ERROR");
  }
});

/**
 * Transform pool hours data from XML format to a more client-friendly structure
 * @param {Object} poolHoursData - Parsed XML pool hours data
 * @returns {Object} - Transformed pool hours object
 */
function transformPoolHoursData(poolHoursData) {
  // Safety check to ensure poolHoursData has the expected structure
  if (!poolHoursData || !poolHoursData.poolHours) {
    return { lastUpdated: new Date().toISOString() };
  }

  const poolHours = poolHoursData.poolHours;
  const result = {
    lastUpdated: poolHours.$ && poolHours.$.lastUpdated 
      ? poolHours.$.lastUpdated 
      : new Date().toISOString(),
    weekdays: {},
    weekend: {},
    specialDays: []
  };

  // Process weekday sessions
  if (poolHours.weekdays && poolHours.weekdays.session) {
    const sessions = Array.isArray(poolHours.weekdays.session) 
      ? poolHours.weekdays.session 
      : [poolHours.weekdays.session];
      
    sessions.forEach(session => {
      if (session.$ && session.$.type && session.$.hours) {
        result.weekdays[session.$.type] = session.$.hours;
      }
    });
  }

  // Process weekend sessions
  if (poolHours.weekend && poolHours.weekend.session) {
    const sessions = Array.isArray(poolHours.weekend.session) 
      ? poolHours.weekend.session 
      : [poolHours.weekend.session];
      
    sessions.forEach(session => {
      if (session.$ && session.$.type && session.$.hours) {
        result.weekend[session.$.type] = session.$.hours;
      }
    });
  }

  // Process special days
  if (poolHours.specialHours && poolHours.specialHours.day) {
    const specialDays = Array.isArray(poolHours.specialHours.day) 
      ? poolHours.specialHours.day 
      : [poolHours.specialHours.day];
      
    specialDays.forEach(day => {
      if (day.$ && day.$.date) {
        result.specialDays.push({
          date: day.$.date,
          reason: day.$.reason || null,
          hours: day.$.hours || null
        });
      }
    });
  }

  return result;
}