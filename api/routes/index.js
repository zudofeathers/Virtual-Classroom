var express = require("express");
var router = express.Router();
var { expressjwt: jwt } = require("express-jwt");
const dotenv = require("dotenv");
dotenv.config();
var auth = jwt({
  secret: "MY_SECRET",
  userProperty: "payload",
  algorithms: ["HS256"],
});

var ctrlProfile = require("../controllers/profile");
var ctrlAuth = require("../controllers/authentication");
var ctrlCourse = require("../controllers/course");
// profile
router.get("/profile", auth, ctrlProfile.profileRead);

// courses
//router.get('/courses', auth, );

// authentication
router.post("/register", ctrlAuth.register);
router.post("/login", ctrlAuth.login);

//edit profile
router.post("/editProfile", ctrlProfile.editProfile);

//new course
router.post("/newCourse", ctrlCourse.newCourse);

//retrieve user's courses
router.get("/courseDetails/:course", ctrlCourse.courseDetails);
router.get("/allCourses", ctrlCourse.allCourses);
router.post("/addSyllabus", ctrlCourse.addSyllabus);
router.post("/joinCourse", ctrlCourse.joinCourse);
router.post("/handInAssignment", ctrlCourse.handInAssignment);
router.post("/updateAssignmentGrade", ctrlCourse.updateAssignmentGrade);
router.post("/addResource", ctrlCourse.addResource);
router.post("/startCourseSession", ctrlCourse.startCourseSession);

//Forgot Password
router.post("/forgotPassword", ctrlAuth.forgotPassword);
router.post("/resetPassword", ctrlAuth.resetPassword);

module.exports = router;
