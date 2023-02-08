import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthenticationService, UserDetails } from "../authentication.service";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Course, CourseDropdown, ResourceType } from "../models/course";

//let jitsi = require('https://meet.jit.si/external_api.js');
declare function JitsiMeetExternalAPI(a, b): void;

@Component({
  // selector: 'app-course',
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.css"],
})
export class CourseComponent implements OnInit {
  user: UserDetails;
  resourceInput: File | string;
  resourceTypeDropdown: ResourceType = ResourceType.FILE;
  api;
  course: Course = {
    name: "",
    code: "",
    owner: "",
    attendees: [],
    assignment: null,
    resources: [],
  };
  handedInAssignment = null;
  sessionStatus: boolean = false;
  newSyllabus = "";
  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };
  coursedropdown: CourseDropdown = CourseDropdown.RESOURCES;
  constructor(
    private route: ActivatedRoute,
    private auth: AuthenticationService,
    private router: Router,
    private http: HttpClient
  ) {}
  ngOnInit() {
    this.auth.profile().subscribe(
      (user) => {
        this.route.params.subscribe((params) => {
          this.http
            .get("/api/courseDetails/" + params.courseCode, this.httpOptions)
            .subscribe((res: any) => {
              this.course = res;
              if (!user.faculty) {
                this.handedInAssignment = res.attendees.find(
                  (attendee) => attendee.user === user.email
                ).submittedAssignment;
              }
            });
        });
        this.user = user;
      },
      (err) => {
        console.error(err);
      }
    );
  }
  handleCourseDropdown(clicked: CourseDropdown) {
    this.coursedropdown = clicked;
  }
  public get courseDropdownEnum(): typeof CourseDropdown {
    return CourseDropdown;
  }
  downloadAssignment(assignment, fileType: string) {
    const decryptedAssignment = this.decryptAssignment(assignment, fileType);
    const downloadURL = URL.createObjectURL(decryptedAssignment);
    const downloadLink = document.createElement("a");

    downloadLink.href = downloadURL;
    downloadLink.download = assignment.name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadURL);
  }
  startSession() {
    var domain = "meet.jit.si";
    var options = {
      roomName: "VirtualClassroom-" + this.course.code, // +"somerandom",
      width: 700,
      height: 600,
      parentNode: document.querySelector("#meet"),
    };
    this.api = new JitsiMeetExternalAPI(domain, options);
    this.sessionStatus = true;
  }
  stopSession() {
    this.api.dispose();
    this.sessionStatus = false;
  }
  addNew(event) {
    if (event.keyCode == 13) {
      if (this.newSyllabus) {
        this.http
          .post(
            "/api/addSyllabus",
            JSON.stringify({
              course: this.course.code,
              syllabus: this.newSyllabus,
            }),
            this.httpOptions
          )
          .subscribe((res: string[]) => {
            this.course.syllabus = res;
          });
      }
    }
  }
  onAssignmentHandIn(event) {
    const formData = new FormData();
    const file: File = event.target.files[0];
    if (file) {
      formData.append("courseCode", this.course.code);
      formData.append("userId", this.user._id);
      formData.append("assignment", file, file.name);
      this.http
        .post("/api/handInAssignment", formData)
        .subscribe((res: any) => {
          this.handedInAssignment = res;
        });
    }
  }
  onGradeAssignment(event, attendeeId) {
    const formData = new FormData();

    formData.append("attendeeId", attendeeId);
    formData.append("courseCode", this.course.code);
    formData.append("grade", event.target.value);
    this.http
      .post("/api/updateAssignmentGrade", formData)
      .subscribe((res: any) => {
        this.handedInAssignment = res;
      });
  }
  decryptAssignment(assignment, fileType: string): Blob {
    let byteChars = atob(assignment.data); //To decrypt data
    let dataArray = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      dataArray[i] = byteChars.charCodeAt(i);
    }
    let byteArray = new Uint8Array(dataArray);
    const pdf = new Blob([byteArray], { type: `application/${fileType}` });
    return pdf;
  }
  public get resourceTypeEnum(): typeof ResourceType {
    return ResourceType;
  }
  typeOfResource(resource: File | string): boolean {
    return typeof resource === "string";
  }
  onChangeResourceType(event) {
    this.resourceTypeDropdown = event.target.value;
  }
  onChangeResourceInput(event) {
    if (this.resourceTypeDropdown === ResourceType.FILE) {
      const file: File = event.target.files[0];
      if (file) {
        this.resourceInput = file;
      }
    } else {
      this.resourceInput = event.target.value;
    }
  }
  onAddResource() {
    const formData = new FormData();
    formData.append("courseCode", this.course.code);

    if (this.resourceTypeDropdown === ResourceType.FILE) {
      formData.append(
        "resource",
        this.resourceInput,
        (this.resourceInput as File).name
      );
    } else {
      formData.append("resource", this.resourceInput);
    }

    this.http
      .post("/api/addResource", formData)
      .subscribe((res: (File | string)[]) => {
        this.course.resources = res;
      });
  }
}
