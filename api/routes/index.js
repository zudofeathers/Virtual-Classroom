var express = require('express');
var router = express.Router();
var { expressjwt: jwt } = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload',
  algorithms: ['HS256']
});

var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
// profile
router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

//edit profile
router.post('/editProfile', ctrlProfile.editProfile);

//Forgot Password
router.post('/forgotPassword', ctrlAuth.forgotPassword);

module.exports = router;
