const requireAuth = (req, res, next) => {
  console.log('Auth middleware called, user in session:', req.session.user);
  
  if (!req.session.user) {
    console.log('No user in session, redirecting to signin');
    req.session.returnTo = req.originalUrl;
    req.session.successMessage = 'Please sign in to access this page.';
    return res.redirect('/users/signin');
  }
  
  console.log('User authenticated, proceeding to dashboard');
  res.locals.user = req.session.user;
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).render('error', {
      title: 'Access Denied',
      message: 'You do not have permission to access this page.',
      error: { status: 403 }
    });
  }
  
  next();
};

module.exports = {
  requireAuth,
  requireAdmin
};