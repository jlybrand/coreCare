const searchService = require("../services/search");
const prospectModel = require('../models/prospect');

const renderSearchForm = (req, res) => {
  res.render("search", {
    title: "Business Search",
    address: req.query.address || "",
    zipcode: req.query.zipcode || "",
    radius: req.query.radius || "25",
    sicCode: req.query.sicCode || "",
  });
};

const handleSearchSubmit = async (req, res) => {
  const { address, zipcode, radius, sicCode } = req.body;

  try {
    const searchResult = await searchService.performSearch({
      address,
      zipcode,
      radius,
      sicCode,
    });

    const businessType = searchResult.businessType || "businesses";

    if (!searchResult.success) {
      return res.render("search", {
        title: "Search",
        errorMessages: [searchResult.error],
        address,
        zipcode,
        radius,
        sicCode,
        showModal: true,
        modalType: "error",
        modalMessage: searchResult.error,
      });
    }

    // If we found a prospect, save it to the database
    if (searchResult.prospect) {
      try {
        await prospectModel.create(searchResult.prospect);
        console.log("Prospect saved to database");
      } catch (error) {
        console.error("Error saving prospect:", error);
      }
    }

    const resultCount = searchResult.count || 0;

    if (resultCount > 19) {
      return res.render("search", {
        title: "Search",
        address,
        zipcode,
        radius,
        sicCode,
        showModal: true,
        modalType: "success",
        modalMessage: `There are ${resultCount} ${businessType} in your search radius.`,
        isEligible: true,
      });
    } else {
      return res.render("search", {
        title: "Search",
        address,
        zipcode,
        radius,
        sicCode,
        showModal: true,
        modalType: "warning",
        modalMessage: "Increase your search radius to find referral partners.",
        isEligible: false,
      });
    }
  } catch (error) {
    console.error("Search controller error:", error);
    return res.render("search", {
      title: "Search",
      errorMessages: ["An unexpected error occurred. Please try again."],
      address,
      zipcode,
      radius,
      sicCode,
    });
  }
};

module.exports = {
  renderSearchForm,
  handleSearchSubmit,
};
