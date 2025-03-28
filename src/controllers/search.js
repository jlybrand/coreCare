const searchService = require('../services/search');

const renderSearchForm = (req, res) => {
  res.render('search', {
    title: 'Business Search',
    address: req.query.address || '',
    zipcode: req.query.zipcode || '',
    radius: req.query.radius || '25',
    sicCode: req.query.sicCode || ''
  });
};

const handleSearchSubmit = async (req, res, next) => {
  const { address, zipcode, radius, sicCode } = req.body;
  
  try {
    const searchResult = await searchService.performSearch({
      address,
      zipcode,
      radius,
      sicCode
    });
    
  } catch (error) {
    console.error('Search controller error:', error);
    
    next(error);
  }
};

module.exports = {
  renderSearchForm,
  handleSearchSubmit
};