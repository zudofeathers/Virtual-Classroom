export type Course = {
  name: string;
  code: string;
  owner: string;
  assignment: { file: File; deadline: string };
  attendees?: Attendee[];
  syllabus?: string[];
  resources: (File | string)[];
};

export type Attendee = {
  user: string;
  submittedAssignment?: File;
  submittedAssignmentDate: string;
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
