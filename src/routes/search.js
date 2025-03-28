const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');

router.get('/', searchController.renderSearchForm);

router.post('/',
  searchController.handleSearchSubmit
);

module.exports = router;