import { Component, OnInit } from "@angular/core";
import { AuthenticationService, UserDetails } from "../authentication.service";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  /*selector: 'app-dashboard',*/
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent {
  user: UserDetails;
  courses: Object[] = [];
  newcourse = {
    code: "",
    name: "",
    owner: "",
    assignment: null,
    assignmentDeadline: null,
  };
  find = false;
  list: Object = [];

  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private http: HttpClient
  ) {}
  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };
  ngOnInit() {
    this.auth.profile().subscribe(
      (user) => {
        this.user = user;
        //Log the user details
        //Load MyCourses
        for (var course in user.courses) {
          this.http
            .get("/api/courseDetails/" + user.courses[course], this.httpOptions)
            .subscribe((res) => {
              this.courses.push(res);
            });
        }
        this.newcourse.owner = user._id;
      },
      (err) => {
        console.error(err);
      }
    );
  }
  onFileSelected(event) {
    const file: File = event.target.files[0];
    if (file) {
      this.newcourse.assignment = file;
    }
  }
  newCourse() {
    const formData = new FormData();
    formData.append(
      "assignment",
      this.newcourse.assignment,
      this.newcourse.assignment.name
    );
    formData.append("name", this.newcourse.name);
    formData.append("code", this.newcourse.code);
    formData.append("owner", this.newcourse.owner);
    formData.append("assignmentDeadline", this.newcourse.assignmentDeadline);
    this.http
      .post("/api/newCourse", formData)
      .subscribe((res: { code: string }) => {
        this.allCourses();
      });
  }
  allCourses() {
    this.http.get("/api/allCourses/", this.httpOptions).subscribe((res) => {
      this.list = res;
      this.find = true;
    });
  }
  joinCourse(courseCode: string) {
    if (!this.user.faculty) {
      this.http
        .post(
          "/api/joinCourse/",
          JSON.stringify({
            courseCode,
            userId: this.user._id,
          }),
          this.httpOptions
        )
        .subscribe((res) => {});
    }
  }
}
