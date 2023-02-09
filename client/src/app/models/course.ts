export type Course = {
  name: string;
  code: string;
  owner: string;
  assignment: File;
  attendees?: AssignmentAnswer[];
  syllabus?: string[];
  resources: (File | string)[];
};

export type AssignmentAnswer = {
  user: string;
  assignment?: File;
  grade?: string;
};

export enum CourseDropdown {
  ATTENDEES = "Attendees",
  RESOURCES = "Resources",
}

export enum ResourceType {
  FILE = "File",
  LINK = "Link",
}
