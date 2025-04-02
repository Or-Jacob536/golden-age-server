// File: server/middleware/xmlParserMiddleware.js
const xml2js = require('xml2js');

/**
 * Middleware to parse XML request bodies
 * 
 * This middleware intercepts requests with 'application/xml' content-type
 * and parses the XML body into a JavaScript object that's accessible via req.body
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const xmlParser = (req, res, next) => {
  // Check if this is an XML request based on Content-Type header
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
    let xmlData = '';
    
    // Collect data chunks
    req.on('data', (chunk) => {
      xmlData += chunk.toString();
    });
    
    // Process complete XML data
    req.on('end', () => {
      if (xmlData) {
        // Set parser options - important for consistent handling of arrays and attributes
        const parser = new xml2js.Parser({
          explicitArray: false,     // Don't create arrays for single elements
          mergeAttrs: false,        // Keep attributes separate
          attrkey: '$',             // Use $ to represent attributes
          charkey: '_',             // Use _ for element text content
          normalizeTags: false,     // Don't convert tags to lowercase
          trim: true                // Trim whitespace from text nodes
        });
        
        // Parse the XML string into a JavaScript object
        parser.parseString(xmlData, (err, result) => {
          if (err) {
            // Handle XML parsing errors with a specific error response
            console.error('XML Parse Error:', err);
            return res.status(400).json({
              success: false,
              message: 'Invalid XML format',
              error: {
                code: 'INVALID_FORMAT',
                details: { message: err.message }
              }
            });
          } else {
            // Store the parsed result in the request body for downstream handlers
            req.body = result;
            // Also store the original XML string which may be needed for storage
            req.rawXml = xmlData;
            next();
          }
        });
      } else {
        // If there's no data, just continue to the next middleware
        next();
      }
    });
    
    // Handle request errors
    req.on('error', (err) => {
      console.error('Request Stream Error:', err);
      res.status(500).json({
        success: false,
        message: 'Error processing request',
        error: {
          code: 'REQUEST_ERROR',
          details: { message: err.message }
        }
      });
    });
  } else {
    // Not XML content, proceed to next middleware
    next();
  }
};

module.exports = xmlParser;