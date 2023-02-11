var mongoose = require("mongoose");
var Course = mongoose.model("Course");
var User = mongoose.model("User");

var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "yourmail@mail.com",
    pass: "yourpassword",
  },
});

const getMailOptions = (listToMailTo, subject, content) => ({
  from: "yourmail@mail.com",
  to: listToMailTo.join(", "),
  subject: subject,
  text: content,
});

module.exports.newCourse = (req, res) => {
  var course = new Course();
  course.name = req.body.name;
  course.code = req.body.code;
  course.owner = req.body.owner;
  course.assignment = req["files"].assignment;

  course.save((err) => {
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
        (err, user) => {
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
      // console.log("course", course);
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
              user._id.equals(attendee.user)
            ).user = user.email;
          });
          res.status(200).json(course);
        });
    });
};

module.exports.allCourses = (req, res) => {
  Course.find({}, (err, courses) => {
    if (err) {
      console.log(err);
      res.status(404).json(err);
    }
    res.status(200).json(courses);
  });
};

module.exports.addSyllabus = (req, res) => {
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
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(404).json(err);
      }
      res.status(200).json(data.syllabus);
    }
  );
};

module.exports.joinCourse = (req, res) => {
  var { courseCode, userId } = req.body;

  var conditions = {
    code: courseCode,
    "attendees.user": { $ne: userId },
  };

  var update = {
    $addToSet: { attendees: { user: userId } },
  };
  Course.findOneAndUpdate(conditions, update, function (err, doc) {
    if (err) {
      console.log("joining course failed" + err);
      res.status(404).json(err);
    }
    res.status(200).json(courseCode);
  });
};

module.exports.handInAssignment = (req, res) => {
  var { courseCode, userId } = req.body;

  var conditions = {
    code: courseCode,
    "attendees.user": userId,
  };

  var update = {
    $set: {
      "attendees.$.submittedAssignment": req["files"].assignment,
    },
  };
  Course.findOneAndUpdate(conditions, update, function (err, doc) {
    if (err) {
      console.log("Sumbimtting assignment failed" + err);
      res.status(404).json(err);
    }
    res.status(200).json(doc);
  });
};

module.exports.updateAssignmentGrade = (req, res) => {
  var { courseCode, attendeeId, grade } = req.body;

  var conditions = {
    code: courseCode,
    "attendees._id": attendeeId,
  };

  var update = {
    $set: {
      "attendees.$.grade": grade,
    },
  };
  Course.findOneAndUpdate(conditions, update, function (err, doc) {
    if (err) {
      console.log("Giving this assingment aa grade failed" + err);
      res.status(404).json(err);
    }
    res.status(200).json(doc);
  });
};

module.exports.addResource = (req, res) => {
  var { courseCode, resource } = req.body;

  var conditions = {
    code: courseCode,
  };

  var update = {
    $push: {
      resources: req["files"] ? req["files"].resource : resource,
    },
  };
  Course.findOneAndUpdate(
    conditions,
    update,
    { new: true },
    function (err, doc) {
      if (err) {
        console.log("Adding a resource to this course failed" + err);
        res.status(404).json(err);
      }
      sendMailUpdate(
        doc,
        `A RESOURCE HAS BEEN ADDED to ${doc.code}`,
        `A resource has been added to the course ${doc.code}. Make sure to check it out before submitting your assignment!`
      );
      res.status(200).json(doc.resources);
    }
  );
};

const sendMailUpdate = (course, subject, content) => {
  User.find()
    .where("_id")
    .in(course.attendees.map((attendee) => attendee.user))
    .exec((err, users) => {
      if (err) {
        console.log(err);
      }
      const usersEmailList = users.map((user) => user.email);
      console.log(usersEmailList);
      transporter.sendMail(
        getMailOptions(usersEmailList, subject, content),
        function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        }
      );
    });
};
