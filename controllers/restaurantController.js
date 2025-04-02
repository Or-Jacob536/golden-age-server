const { Op } = require("sequelize");
const xml2js = require("xml2js");
const asyncHandler = require("../middleware/asyncHandler");
const { RestaurantMenu, RestaurantHours } = require("../models");
const AppError = require("../utils/appError");

/**
 * @desc    Get restaurant hours
 * @route   GET /api/restaurant/hours
 * @access  Public
 */
exports.getRestaurantHours = asyncHandler(async (req, res) => {
  // Get the most recent restaurant hours
  const hoursRecord = await RestaurantHours.findOne({
    order: [["lastUpdated", "DESC"]],
  });

  if (!hoursRecord) {
    throw new AppError("Restaurant hours not found", 404, "NOT_FOUND");
  }

  // Parse the JSON string
  // NOTE: Added try/catch for more robust error handling
  try {
    const hours = JSON.parse(hoursRecord.hoursJson);
    res.json(hours);
  } catch (error) {
    throw new AppError("Invalid hours data format", 500, "DATA_ERROR");
  }
});

/**
 * @desc    Update restaurant hours
 * @route   PUT /api/restaurant/hours
 * @access  Private (Admin/Staff)
 * @note    This endpoint accepts JSON data in the request body (not XML)
 */
exports.updateRestaurantHours = asyncHandler(async (req, res) => {
  // Validate that the request body contains the required structure
  // NOTE: Added validation to ensure data has required structure
  if (!req.body || !req.body.weekdays || !req.body.weekend) {
    throw new AppError(
      "Invalid hours data format. Must include weekdays and weekend schedules",
      400,
      "VALIDATION_ERROR"
    );
  }

  // Create a new restaurant hours record
  // NOTE: Stringify the entire request body, which should be in JSON format
  const hoursRecord = await RestaurantHours.create({
    hoursJson: JSON.stringify(req.body),
    lastUpdated: new Date(),
  });

  res.status(200).json({
    success: true,
    message: "Restaurant hours updated successfully",
    id: hoursRecord.id,
  });
});

/**
 * @desc    Get daily menu
 * @route   GET /api/restaurant/menu
 * @access  Public
 */
exports.getDailyMenu = asyncHandler(async (req, res) => {
  // Get date from query parameter or use today's date
  const date = req.query.date || new Date().toISOString().split("T")[0];

  // Get the menu for the specified date
  const menuRecord = await RestaurantMenu.findOne({
    where: { date },
  });

  if (!menuRecord) {
    throw new AppError(
      "Menu not found for the specified date",
      404,
      "NOT_FOUND"
    );
  }

  // Parse the XML string to JSON
  // NOTE: Added try/catch for robust error handling
  try {
    const parser = new xml2js.Parser({ explicitArray: false });
    const menuData = await parser.parseStringPromise(menuRecord.menuXml);

    // Transform the data for the client
    const transformedMenu = transformMenuData(menuData);
    res.json(transformedMenu);
  } catch (error) {
    console.error("XML parsing error:", error);
    throw new AppError("Error parsing menu data", 500, "DATA_ERROR");
  }
});

/**
 * @desc    Get weekly menu
 * @route   GET /api/restaurant/menu/weekly
 * @access  Public
 */
exports.getWeeklyMenu = asyncHandler(async (req, res) => {
  // Get start date from query parameter or use today's date
  let startDate = req.query.startDate
    ? new Date(req.query.startDate)
    : new Date();

  // Adjust to the beginning of the week (Sunday)
  const day = startDate.getDay();
  startDate.setDate(startDate.getDate() - day);

  // Format date as YYYY-MM-DD
  const formattedStartDate = startDate.toISOString().split("T")[0];

  // Calculate end date (Saturday)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  const formattedEndDate = endDate.toISOString().split("T")[0];

  // Get menus for the week
  const menuRecords = await RestaurantMenu.findAll({
    where: {
      date: {
        [Op.between]: [formattedStartDate, formattedEndDate],
      },
    },
    order: [["date", "ASC"]],
  });

  // Transform each menu
  const weeklyMenus = [];
  
  // NOTE: Added try/catch for each menu to handle individual XML parsing errors
  for (const record of menuRecords) {
    try {
      const parser = new xml2js.Parser({ explicitArray: false });
      const menuData = await parser.parseStringPromise(record.menuXml);
      const transformedMenu = transformMenuData(menuData);
      weeklyMenus.push(transformedMenu);
    } catch (error) {
      console.error(`Error parsing menu for date ${record.date}:`, error);
      // Skip broken records but continue processing others
      continue;
    }
  }

  res.json({
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    menus: weeklyMenus,
  });
});

/**
 * @desc    Upload menu XML
 * @route   POST /api/restaurant/menu/upload
 * @access  Private (Admin/Staff)
 * @note    This endpoint handles both direct XML uploads and parsed XML objects
 *          from the xmlParserMiddleware
 */
exports.uploadMenu = asyncHandler(async (req, res) => {
  let menuObject, date, xmlString;

  // IMPORTANT FIX: Handle different input formats
  // Case 1: If the request has been processed by xmlParserMiddleware
  if (req.body && req.body.menu) {
    menuObject = req.body;
    
    // Extract date from XML
    date = req.body.menu.$ && req.body.menu.$.date;
    
    // Convert XML object back to string for storage
    const builder = new xml2js.Builder();
    xmlString = builder.buildObject(menuObject);
  } 
  // Case 2: If raw XML string is provided (not processed by middleware)
  else if (req.body && typeof req.body === 'string') {
    try {
      // Parse raw XML string to get the date attribute
      const parser = new xml2js.Parser({ explicitArray: false });
      menuObject = await parser.parseStringPromise(req.body);
      date = menuObject.menu.$ && menuObject.menu.$.date;
      xmlString = req.body; // Use the original XML string
    } catch (error) {
      throw new AppError("Invalid XML format", 400, "VALIDATION_ERROR");
    }
  }
  // Case 3: Neither valid XML object nor string was provided
  else {
    throw new AppError("No menu XML provided", 400, "VALIDATION_ERROR");
  }

  // Validate the date attribute
  if (!date) {
    throw new AppError(
      "Date attribute is missing in the menu XML",
      400,
      "VALIDATION_ERROR"
    );
  }

  // Create or update menu record
  try {
    const [menuRecord, created] = await RestaurantMenu.upsert({
      date,
      menuXml: xmlString,
      lastUpdated: new Date(),
    });

    res.status(created ? 201 : 200).json({
      success: true,
      message: `Menu ${created ? "created" : "updated"} successfully for ${date}`,
      date,
    });
  } catch (error) {
    console.error("Database error:", error);
    throw new AppError(
      "Failed to save menu to database", 
      500, 
      "DATABASE_ERROR"
    );
  }
});

/**
 * Transform menu data from XML format to a more client-friendly structure
 * @param {Object} menuData - Parsed XML menu data
 * @returns {Object} - Transformed menu object
 */
function transformMenuData(menuData) {
  // Safety check to ensure menuData has the expected structure
  if (!menuData || !menuData.menu) {
    return { date: "unknown", meals: {} };
  }

  const menu = menuData.menu;
  const result = {
    date: menu.$ && menu.$.date ? menu.$.date : "unknown",
    meals: {},
  };

  // Process each meal type
  if (menu.meals) {
    // Process breakfast
    if (menu.meals.breakfast) {
      result.meals.breakfast = {
        mainDishes: arrayify(menu.meals.breakfast.mainDishes?.dish),
        sides: arrayify(menu.meals.breakfast.sides?.dish),
        drinks: arrayify(menu.meals.breakfast.drinks?.drink),
      };
    }

    // Process lunch
    if (menu.meals.lunch) {
      result.meals.lunch = {
        mainDishes: arrayify(menu.meals.lunch.mainDishes?.dish),
        sides: arrayify(menu.meals.lunch.sides?.dish),
        desserts: arrayify(menu.meals.lunch.desserts?.dish),
      };
    }

    // Process dinner
    if (menu.meals.dinner) {
      result.meals.dinner = {
        mainDishes: arrayify(menu.meals.dinner.mainDishes?.dish),
        sides: arrayify(menu.meals.dinner.sides?.dish),
        desserts: arrayify(menu.meals.dinner.desserts?.dish),
      };
    }
  }

  return result;
}

/**
 * Convert a value to an array if it's not already one
 * @param {*} value - The value to convert
 * @returns {Array} - The resulting array
 */
function arrayify(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}