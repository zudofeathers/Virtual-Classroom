export type Course = {
    name: string;
    code: string;
    owner: string;
    users: string[];
    assignment: Object;
    assignmentAnswers?: AssignmentAnswer[]
    syllabus?: string[];
}

export type AssignmentAnswer = { user: string, assignment: File }