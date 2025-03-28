const axios = require('axios');
const config = require('../../config');

const businessTypes = {
  "802101": "dentists",
  "801101": "doctors",
  "599504": "opticians",
  "591205": "pharmacies",
};

const getBusinessTypeName = (sicCode) => {
  return businessTypes[sicCode] || "business";
};

// Fetch businesses near a location from MapQuest API
const fetchNearbyBusinesses = async (origin, radius, sicCode) => {
  try {
    // Log request details in development
    if (config.nodeEnv !== 'production') {
      console.log(`MapQuest API Request: ${config.mapquest.apiUrl}?origin=${origin}, radius=${radius}, business=${getBusinessTypeName(sicCode)}`);
    }
    
    const params = {
      origin: origin,
      hostedDataList: [
        {
          tableName: "mqap.ntpois",
          extraCriteria: "group_sic_code LIKE ?",
          parameters: [`${sicCode}`],
          columnNames: [
            "name",
            "address",
            "city",
            "state",
            "postal_code",
            "phone",
            "group_sic_code",
            "lat",
            "lng",
          ],
        },
      ],
      options: {
        radius: radius,
        maxMatches: 4000,
      },
    };
    
    const apiResponse = await axios.post(
      `${config.mapquest.apiUrl}?${config.mapquest.apiKeyName}=${config.mapquest.apiKeyValue}`,
      params
    );
    
    if (apiResponse.data.resultsCount && apiResponse.data.resultsCount > 0) {
      const searchResults = apiResponse.data.searchResults.map(result => result.fields);
      return searchResults;
    } else {
      return null;
    }
  } catch (error) {
    console.error("MapQuest API error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw new Error(`MapQuest API error: ${error.message}`);
  }
};

module.exports = {
  fetchNearbyBusinesses,
  getBusinessTypeName,
  businessTypes
};