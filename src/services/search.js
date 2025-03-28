const mapQuestService = require('./mapQuest');

const performSearch = async ({ address, zipcode, radius, sicCode }) => {
  try {
    const origin = `${address} ${zipcode}`;
    
    const businessType = mapQuestService.getBusinessTypeName(sicCode);
    
    console.log(`Performing search for ${businessType} within ${radius} miles of "${origin}"`);
    
    const searchResults = await mapQuestService.fetchNearbyBusinesses(origin, radius, sicCode);
    
    // Handle no results case
    if (!searchResults) {
      console.log('No results found');
      return {
        success: false,
        error: 'No results found. Please ensure your address details are correct.'
      };
    }
    
    console.log(`Found ${searchResults.length} ${businessType} results`);
    
    // Log first result for debugging
    if (searchResults.length > 0) {
      console.log('Sample result:', searchResults[0]);
    }
    
    const result = {
      success: true,
      count: searchResults.length,
      businessType: businessType,
      radius: radius,
      results: searchResults
    };
    
    console.log('Result Object: ', result)
    return result;
  } catch (error) {
    console.error('Search service error:', error);
    return {
      success: false,
      error: 'Error performing search. Please try again.'
    };
  }
};

module.exports = {
  performSearch
};