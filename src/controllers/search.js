
// Render the search form page

const renderSearchForm = (req, res) => {
  res.render('search', {
    title: 'Business Search',
    address: req.query.address || '',
    zipcode: req.query.zipcode || '',
    radius: req.query.radius || '10',
    sicCode: req.query.sicCode || ''
  });
};

module.exports = {
  renderSearchForm,
};