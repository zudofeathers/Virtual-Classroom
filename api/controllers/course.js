var mongoose = require("mongoose");
var Course = mongoose.model("Course");
var User = mongoose.model("User");

module.exports.newCourse = function (req, res) {
  var course = new Course();
  course.name = req.body.name;
  course.code = req.body.code;
  course.owner = req.body.owner;
  course.assignment = req["files"].assignment;

  course.save(function (err) {
    if (err) {
      console.log("Error..\n" + err);
      res.status(200);
    } else {
      User.findOneAndUpdate(
        {
          _id: req.body.owner,
        },
        {
          $push: {
            courses: req.body.code,
          },
        },
        function (err, user) {
          if (err) {
            return done(err);
          }
          // If user is found in database, add course code to user
          if (user) {
            res.status(200);
            res.json({
              code: req.body.code,
            });
          } else {
            // If user is not found
            res.status(401).json(info);
          }
        }
      );
    }
  });
  if (course) {
  } else {
    console.log("Could not add new curse");
  }
};

module.exports.courseDetails = (req, res) => {
  var code = req.params.course;

  Course.findOne({
    code: code,
  })
    .lean()
    .exec((err, course) => {
      if (err) {
        console.log(err);
        res.status(404).json(err);
      }
      User.find()
        .where("_id")
        .in(course.attendees.map((attendee) => attendee.user))
        .exec((err, users) => {
          if (err) {
            console.log(err);
            res.status(404).json(err);
          }
          users.forEach((user) => {
            course.attendees.find((attendee) =>
              attendee.user.equals(user._id)
            ).user = user.email;
          });
          res.status(200).json(course);
        });
    });
};

module.exports.addSyllabus = function (req, res) {
  var code = req.body.course;

  Course.findOneAndUpdate(
    {
      code: code,
    },
    {
      $push: {
        syllabus: req.body.syllabus,
      },
    },
    {
      new: true,
    },
    function (err, data) {
      if (err) {
        console.log(err);
        res.status(404).json(err);
      }
      res.status(200).json(data.syllabus);
    }
  );
};

module.exports.allCourses = function (req, res) {
  Course.find({}, function (err, courses) {
    if (err) {
      console.log(err);
      res.status(404).json(err);
    }
    res.status(200).json(courses);
  });
};

module.exports.handInAssignment = function (req, res) {
  const { id, courseCode } = req.body;
  Course.findOneAndUpdate(
    { code: courseCode },
    { $pull: { attendees: { user: id } } },
    { new: true },
    function () {
      Course.findOneAndUpdate(
        {
          code: courseCode,
        },
        {
          $push: {
            attendees: {
              user: id,
              submittedAssignment: req["files"].assignment,
            },
          },
        },
        {
          new: true,
        },
        function (err, data) {
          if (err) {
            console.log("handing in assignment failed" + err);
            res.status(404).json(err);
          }
          res.status(200).json(req["files"].assignment);
        }
      );
    }
  );
};
