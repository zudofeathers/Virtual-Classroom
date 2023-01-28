export type Course = {
  name: string;
  code: string;
  owner: string;
  assignment: Object;
  attendees?: AssignmentAnswer[];
  syllabus?: string[];
};

export type AssignmentAnswer = {
  user: string;
  assignment?: File;
  grade?: string;
};
