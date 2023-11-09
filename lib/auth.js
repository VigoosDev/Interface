// isLoggedIn middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() && req.user.admin === 1) {
      return next();
    }
    req.flash('error', 'Acceso no autorizado');
    res.redirect('/signin');
  }
  
  module.exports = {
    isLoggedIn
  };
