var passport = require("passport");
var mongoose = require("mongoose");
var User = mongoose.model("User");

var sendJSONresponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

module.exports.register = (req, res) => {
  var user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.faculty = req.body.faculty;
  user.setPassword(req.body.password);

  user.save((err, result) => {
    if (err) {
      console.log("err", err);
    } else {
      var token;
      token = user.generateJwt();
      res.status(200);
      res.json({
        token: token,
      });
    }
  });
};

module.exports.login = (req, res) => {
  passport.authenticate("local", (err, user, info) => {
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if (user) {
      token = user.generateJwt();
      res.status(200);
      res.json({
        token: token,
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);
};

module.exports.forgotPassword = (req, res) => {
  /* TODO :
   Retreive Email id
   Use User.find to check if user exists
   if yes send else send back error
  */
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return done(err);
    }
    // If user is found in database
    if (user) {
      res.status(200);
      res.json({
        email: req.body.email,
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);
};
