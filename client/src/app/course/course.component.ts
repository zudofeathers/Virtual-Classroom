import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService, UserDetails } from '../authentication.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

//let jitsi = require('https://meet.jit.si/external_api.js');
declare function JitsiMeetExternalAPI(a, b): void;

@Component({
  // selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
  user: UserDetails;
  courseCode
  courseName
  api
  course: any = { name: "", code: "" }
  handedInAssignment = null;
  sessionStatus: boolean = false
  newSyllabus = "";
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private route: ActivatedRoute, private auth: AuthenticationService, private router: Router, private http: HttpClient) {
    this.route.params.subscribe(params => {
      this.courseCode = params.courseCode;
      this.course.code = params.courseCode;
      this.http.get('/api/courseDetails/' + this.courseCode, this.httpOptions)
        .subscribe((res: any) => {
          let byteChars = atob(res.assignment.data); //To decrypt data
          let dataArray = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            dataArray[i] = byteChars.charCodeAt(i);
          }
          let byteArray = new Uint8Array(dataArray)
          let pdf = new Blob(
            [byteArray],
            { type: 'application/pdf' }
          )
          this.course = res;
          this.course.assignment = pdf
          this.handedInAssignment = res.assigmentAnswers.find(assignment => assignment.user === this.user.email);
          console.log(this.handedInAssignment)
        });
    });
  }
  ngOnInit() {
    this.auth.profile().subscribe(user => {
      this.user = user;
    }, (err) => {
      console.error(err);
    });

  }
  downloadAssignment() {
    var downloadURL = URL.createObjectURL(this.course.assignment);
    window.open(downloadURL)
  }
  startSession() {
    console.log("Connecting to live class ");
    var domain = "meet.jit.si";
    var options = {
      roomName: "VirtualClassroom-" + this.courseCode,// +"somerandom",
      width: 700,
      height: 600,
      parentNode: document.querySelector('#meet')
    }
    this.api = new JitsiMeetExternalAPI(domain, options);
    this.sessionStatus = true;
  }
  stopSession() {
    this.api.dispose();
    this.sessionStatus = false;
  }
  sendMessage() {
  }
  addNew(event) {
    if (event.keyCode == 13) {
      console.log("Enter pressed.");
      if (this.newSyllabus) {
        console.log("Adding Syllabus..");

        this.http.post('/api/addSyllabus',
          JSON.stringify({
            "course": this.course.code,
            "syllabus": this.newSyllabus
          }), this.httpOptions)
          .subscribe(res => {
            console.log(res);
            this.course = res;
          });
      }
    }

  }
  onAssigmentHandIn(event) {
    const formData = new FormData();
    const file: File = event.target.files[0];
    if (file) {
      formData.append("courseCode", this.course.code);
      formData.append("email", this.user.email);
      formData.append("assignment", file, file.name);
      this.http.post('/api/handInAssignment', formData)
        .subscribe(res => {
          console.log("assigment list:", res);
        });
    }
  }
}
