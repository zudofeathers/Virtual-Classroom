var mongoose = require("mongoose");
var User = mongoose.model("User");

module.exports.profileRead = (req, res) => {
  if (!req.auth._id) {
    res.status(401).json({
      message: "UnauthorizedError: private profile",
    });
  } else {
    User.findById(req.auth._id).exec((err, user) => {
      res.status(200).json(user);
    });
  }
};

module.exports.editProfile = (req, res) => {
  var id = req.body._id;
  User.findByIdAndUpdate(
    id,
    {
      dob: req.body.dob,
      gender: req.body.gender,
      phone: req.body.phone,
      education: req.body.education,
      //TODO : same for other updates
    },
    { new: true },
    (err, user) => {
      if (err) console.log(err);
      else {
        res.status(200).json(user);
      }
    }
  );
};
