var mongoose = require("mongoose");
var Course = mongoose.model("Course");
var User = mongoose.model("User");

module.exports.newCourse = function (req, res) {
  var course = new Course();
  course.name = req.body.name;
  course.code = req.body.code;
  course.owner = req.body.owner;
  course.users = [req.body.owner]; //owner also a user, add to user table also ...
  course.assignment = req["files"].assignment;

  course.save(function (err) {
    if (err) {
      console.log("Error..\n" + err);
      res.status(200);
    } else {
      User.findOneAndUpdate(
        {
          email: req.body.owner,
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
            // user.courses.push(req.body);

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

module.exports.addAssignment = function (req, res) {
  var code = req.params.course;

  Course.findOneAndUpdate(
    {
      code: code,
    },
    function (err, course) {
      if (err) {
        console.log(err);
        res.status(404).json(err);
      }
      res.status(200).json(course);
    }
  );
};

module.exports.courseDetails = function (req, res) {
  var code = req.params.course;

  Course.findOne(
    {
      code: code,
    },
    function (err, course) {
      if (err) {
        console.log(err);
        res.status(404).json(err);
      }
      res.status(200).json(course);
    }
  );
};

module.exports.courseAssignment = function (req, res) {
  var code = req.params.course;

  Course.findOne(
    {
      code: code,
    },
    function (err, course) {
      if (err) {
        console.log(err);
        res.status(404).json(err);
      }

      res.status(200).json(course.assignment);
    }
  );
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
  const { email, courseCode } = req.body;
  Course.findOneAndUpdate(
    { code: courseCode },
    { $pull: { assignmentAnswers: { user: email } } },
    { new: true },
    function () {
      Course.findOneAndUpdate(
        {
          code: courseCode,
        },
        {
          $push: {
            assignmentAnswers: {
              user: email,
              assignment: req["files"].assignment,
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
