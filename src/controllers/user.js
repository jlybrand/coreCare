const userService = require('../services/user');
const clientModel = require('../models/client')

const renderRegistrationForm = (req, res) => {
  // Get search data from session if available
  const searchData = req.session.searchData || {};
  
  res.render('register', {
    title: 'Register',
    eligibilityMsg: searchData.eligibilityMsg,
    claimMsg: searchData.claimMsg
  });
};

const handleRegistration = async (req, res, next) => {
  const { firstname, lastname, password } = req.body;
  const email = req.body.email.toLowerCase();
  
  // Get eligible results from session (set during search)
  const searchData = req.session.searchData || {};
  const eligibleResults = searchData.eligibleResults || [];
  
  try {
    // Register user and save targets
    const result = await userService.registerUser(
      { firstname, lastname, email, password },
      eligibleResults
    );
    
    if (!result.success) {
      return res.render('register', {
        title: 'Registration Error',
        errorMessages: [result.error],
        firstname,
        lastname,
        email,
        eligibilityMsg: searchData.eligibilityMsg,
        claimMsg: searchData.claimMsg
      });
    }
    
    // Clear search data from session
    delete req.session.searchData;
    
    req.session.successMessage = 'Registration successful! You can now sign in.';
    
    res.redirect('/users/signin');
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

const renderSignInForm = (req, res) => {
  res.render('signin', {
    title: 'Sign In',
    successMessage: req.session.successMessage
  });
  delete req.session.successMessage;
};

const handleSignIn = async (req, res, next) => {
  const email = req.body.email.toLowerCase(); 
  const { password } = req.body;
  
  try {
    const client = await clientModel.authenticate(email, password);
    
    if (!client) {
      return res.render('signin', {
        title: 'Sign In',
        errorMessages: ['Invalid email or password'],
        email
      });
    }
    
    req.session.user = {
      id: client.id,
      email: client.email,
      firstname: client.first_name,
      lastname: client.last_name,
      isAdmin: client.isAdmin
    };
    
    const redirectTo = '/dashboard';
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Sign-in error:', error);
    next(error);
  }
};


module.exports = {
  renderRegistrationForm,
  handleRegistration,
  renderSignInForm,
  handleSignIn
};