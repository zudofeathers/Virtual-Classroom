export type Course = {
  name: string;
  code: string;
  owner: string;
  assignment: { file: File; deadline: String };
  attendees?: Attendee[];
  syllabus?: string[];
  resources: (File | string)[];
};

export type Attendee = {
  user: string;
  assignment?: File;
  submittedAssignmentDate: String;
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
