import { Component, OnInit } from '@angular/core';
import { AuthenticationService, UserDetails } from '../authentication.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  /*selector: 'app-dashboard',*/
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent {
  user: UserDetails;
  courses: Object[] = []
  newcourse = {
    code: "",
    name: "",
    owner: "",
    assignment: null,
  };
  find = false;
  list: Object = [];

  constructor(private auth: AuthenticationService, private router: Router, private http: HttpClient) { }
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  ngOnInit() {
    this.auth.profile().subscribe(user => {
      this.user = user;
      //Log the user details
      console.log(user.courses);
      //Load MyCourses
      for (var course in user.courses) {

        console.log("Requesting " + user.courses[course]);
        this.http.get('/api/courseDetails/' + user.courses[course], this.httpOptions)
          .subscribe(res => {
            console.log(res);
            this.courses.push(res);
          });
      }
      this.newcourse.owner = user.email;
    }, (err) => {
      console.error(err);
    });

  }
  onFileSelected(event) {
    const file: File = event.target.files[0];
    if (file) {
      this.newcourse.assignment = file;
      console.log("file", file)

    }
  }
  newCourse() {
    console.log("New course is being created", this.newcourse.assignment);

    const formData = new FormData();
    formData.append("assignment", this.newcourse.assignment, this.newcourse.assignment.name);

    console.log("formDataformDataformDataformData", formData)
    this.http.post('/api/newCourse',
      JSON.stringify({
        "name": this.newcourse.name,
        "code": this.newcourse.code,
        "owner": this.newcourse.owner
      }), this.httpOptions)
      .subscribe((res: { code: string }) => {
        console.log(res)
        this.http.post(`/api/addAssignment/${res.code}`, formData, {
          headers: new HttpHeaders({ 'Content-Type': 'application/pdf' })
        }).subscribe(res2 => console.log(res2))
      });
    // this.router.navigateByUrl('/newCourse');
  }

  allCourses() {
    console.log("Getting All Courses");
    this.http.get('/api/allCourses/', this.httpOptions)
      .subscribe(res => {
        console.log(res);
        this.list = res;
        this.find = true;
      });
  }

}
