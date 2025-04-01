const express = require('express');
const router = express.Router();
const userService = require('../services/user'); 

// Dashboard route
router.get('/', async (req, res, next) => {
  // Check if user is authenticated
  if (!req.session.user) {
    return res.redirect('/users/signin');
  }
  
  try {
    // Get user's targets
    const result = await userService.getUserTargets(req.session.user.username);
    
    if (!result.success) {
      req.flash('error', result.error || 'Failed to load targets');
      return res.render('dashboard', {
        title: 'Your Dashboard',
        user: req.session.user,
        targets: []
      });
    }
    
    res.render('dashboard', {
      title: 'Your Dashboard',
      user: req.session.user,
      targets: result.targets
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.flash('error', 'An unexpected error occurred');
    res.render('dashboard', {
      title: 'Your Dashboard',
      user: req.session.user,
      targets: []
    });
  }
});

module.exports = router;