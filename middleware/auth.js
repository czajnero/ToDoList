const jwt = require('jsonwebtoken');
const config = require('config');
const {User} = require('../models/user');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    User.findById(decoded._id).select('-password')
      .then(user => {
        if (user) {
          req.user = user;
          return next();
        } else {
          throw user;
        }})
      .catch(err => res.status(401).send('Access denied. User Id not found.'));
  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
}