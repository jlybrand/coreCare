const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();

router.get('/register', userController.renderRegistrationForm);
router.post('/register', 
  userController.handleRegistration
);

router.get('/signin', (req, res) => {
  res.render('signin', {
    title: 'Sign In',
    successMessage: req.session.successMessage
  });
});

module.exports = router;