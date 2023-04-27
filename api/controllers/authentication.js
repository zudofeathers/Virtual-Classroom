var passport = require("passport");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var nodemailer = require("nodemailer");
const crypto = require("crypto");

const generateToken = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString("hex"));
    });
  });
};

var sendJSONresponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

var transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "vinayakapunjabi@outlook.com",
    pass: "Vinayakap12$#",
  },
});

const getMailOptions = (email, token) => {
  return {
    from: "vinayakapunjabi@outlook.com",
    to: email,
    subject: "Reset your password",
    text: `Please click the following link to reset your password: http://localhost:4200/forgotpassword/${token}`,
  };
};

module.exports.register = function (req, res) {
  var user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.faculty = req.body.faculty;
  user.setPassword(req.body.password);
  let errors = [];
  if (
    !req.body.email.match(
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    )
  ) {
    errors.push("email");
  }
  if (
    !req.body.password.match(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/
    )
  ) {
    errors.push("password");
  }
  if (errors.length > 0) {
    res.status(404).json(errors);
    return;
  }
  user.save(function (err, result) {
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

module.exports.login = function (req, res) {
  passport.authenticate("local", function (err, user, info) {
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
      res.status(401).json({
        message:
          "A user with this combination of email and password does not exist",
      });
    }
  })(req, res);
};

// Reset password endpoint
module.exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  // Find user by token
  const user = await User.findOne({ resetPasswordToken: token });

  if (!user) {
    res.status(400).json({ message: "Invalid or expired token" });
    return;
  }
  if (
    !password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/)
  ) {
    res.status(404).json("password");
    return;
  }
  user.setPassword(password);
  user.resetPasswordToken = "";
  // Update user's password and clear resetPasswordToken field
  await User.updateOne({ _id: user._id }, user);

  res.status(200).json({ message: "Password reset successful" });
};

// Forgot password endpoint
module.exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({ message: "No user found with that email" });
    return;
  }

  // Generate password reset token and save it to the user's document
  const token = await generateToken();
  await User.updateOne(
    { _id: user._id },
    { $set: { resetPasswordToken: token } }
  );
  // Send password reset email
  await transporter.sendMail(
    getMailOptions(email, token),
    function (error, info) {
      if (error) {
        console.log(error);
      } else {
        res.status(200).json({ message: "Password reset email sent" });
      }
    }
  );
};
