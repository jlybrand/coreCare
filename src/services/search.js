const mapQuestService = require("./mapQuest");
const targetModel = require('../models/target');

const findProspect = (origin, results) => {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return null;
  }

  // Find the result that matches the origin address the user entered 
  const prospect = results.find(
    (result) =>
      origin.includes(result.address) && origin.includes(result.postal_code)
  );

  return prospect || null;
};

// Filter eligible results by removing the prospect and already claimed targets
 const filterEligibleResults = (results, prospect, claimedAddresses) => {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return [];
  }

  const addresses = Array.isArray(claimedAddresses) ? claimedAddresses : [];

  return results.filter((result) => {
    if (prospect && result.address === prospect.address) {
      return false;
    }

    if (addresses.includes(result.address)) {
      return false;
    }

    return true;
  });
};

const performSearch = async ({ address, zipcode, radius, sicCode }) => {
  try {
    const origin = `${address} ${zipcode}`;

    const businessType = mapQuestService.getBusinessTypeName(sicCode);

    console.log(
      `Performing search for ${businessType} within ${radius} miles of "${origin}"`
    );

    const searchResults = await mapQuestService.fetchNearbyBusinesses(
      origin,
      radius,
      sicCode
    );

    if (!searchResults) {
      console.log("No results found");
      return {
        success: false,
        error:
          "No results found. Please ensure your address details are correct.",
      };
    }

    const prospect = findProspect(origin, searchResults);

    // Get all claimed addresses from the database
    const claimedAddresses = targetModel.getAllAddresses();
    console.log(
      `Found ${claimedAddresses.length} already claimed addresses in database`
    );

    // Filter the results to get eligible businesses
    const eligibleResults = filterEligibleResults(searchResults, prospect, claimedAddresses);
    console.log(`After filtering, ${eligibleResults.length} eligible results remain`);

    console.log(`Found ${searchResults.length} ${businessType} results`);
    if (prospect) {
      console.log("Identified prospect:", prospect);
    } else {
      console.log("No prospect identified at the search location");
    }

    const result = {
      success: true,
      count: eligibleResults.length, 
      businessType: businessType,
      radius: radius,
      results: searchResults,
      eligibleResults: eligibleResults, 
      prospect: prospect
    };
    console.log("Result Object: ", eligibleResults.slice(0, 4));
    return result;
  } catch (error) {
    console.error("Search service error:", error);
    return {
      success: false,
      error: "Error performing search. Please try again.",
    };
  }
};

module.exports = {
  findProspect,
  performSearch,
};
