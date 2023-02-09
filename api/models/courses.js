var mongoose = require("mongoose");

// Course collection schema
var courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  attendees: {
    type: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        submittedAssignment: {
          type: mongoose.Schema.Types.Mixed,
        },
        grade: {
          type: String,
        },
      },
    ],
    default: [],
  },
  syllabus: {
    type: [String],
    default: [],
  },
  resources: {
    type: [mongoose.Schema.Types.Mixed | String],
    default: [],
  },
  assignment: {
    type: mongoose.Schema.Types.Mixed,
  },
});

mongoose.model("Course", courseSchema, "courses");
