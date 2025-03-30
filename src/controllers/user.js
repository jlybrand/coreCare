const userService = require('../services/user');

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
  const { firstname, lastname, email, password } = req.body;

  // Debug session data
  console.log('Session data:', JSON.stringify(req.session));
  console.log('Search data in session:', JSON.stringify(req.session.searchData));
  console.log('Eligible results count:', 
    req.session.searchData?.eligibleResults?.length || 0);
  
  // Get eligible results from session (set during search)
  const searchData = req.session.searchData || {};
  const eligibleResults = searchData.eligibleResults || [];


  // More logging
  console.log('Eligible results to save:', JSON.stringify(eligibleResults));
  
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
    
    // Set success message
    req.session.successMessage = 'Registration successful! You can now sign in.';
    
    // Redirect to sign in page
    res.redirect('/users/signin');
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

module.exports = {
  renderRegistrationForm,
  handleRegistration
};