const express = require('express');
const searchController = require('../controllers/search');

const router = express.Router();

// Display the search form
router.get('/', searchController.renderSearchForm);

module.exports = router;