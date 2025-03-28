const mapQuestService = require('./mapQuest');

const findProspect = (origin, results) => {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return null;
  }
  
  // Find the result that matches the origin address
  // The location the user entered in the search
  const prospect = results.find(result => 
    origin.includes(result.address) && 
    origin.includes(result.postal_code)
  );
  
  return prospect || null;
};

const performSearch = async ({ address, zipcode, radius, sicCode }) => {
  try {
    const origin = `${address} ${zipcode}`;
    
    const businessType = mapQuestService.getBusinessTypeName(sicCode);
    
    console.log(`Performing search for ${businessType} within ${radius} miles of "${origin}"`);
    
    const searchResults = await mapQuestService.fetchNearbyBusinesses(origin, radius, sicCode);
    
    if (!searchResults) {
      console.log('No results found');
      return {
        success: false,
        error: 'No results found. Please ensure your address details are correct.'
      };
    }
    
    const prospect = findProspect(origin, searchResults);
    
    console.log(`Found ${searchResults.length} ${businessType} results`);
    if (prospect) {
      console.log('Identified prospect:', prospect);
    } else {
      console.log('No prospect identified at the search location');
    }
    
    const result = {
      success: true,
      count: searchResults.length,
      businessType: businessType,
      radius: radius,
      results: searchResults,
      prospect: prospect
    };
    console.log('Result Object: ', searchResults.slice(0,4))
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
  findProspect,
  performSearch
};