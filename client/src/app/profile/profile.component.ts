import { Component } from "@angular/core";
import { AuthenticationService, UserDetails } from "../authentication.service";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  templateUrl: "./profile.component.html",
})
export class ProfileComponent {
  details: UserDetails;
  editNow: Boolean = false;
  // details = {
  //   dob:"",
  //   gender:"",
  //   education:"",
  //   phone:"",
  //   email:""
  // }

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
        //Log the user details
        console.log(user);
        this.details = user;
      },
      (err) => {
        console.error("dingessss", err);
      }
    );
  }
  // fields = [];
  // values = [];

  editProfile() {
    this.http
      .post("/api/editProfile", JSON.stringify(this.details), this.httpOptions)
      .subscribe((res) => console.log(res));
    // this.router.navigateByUrl('/newCourse');
  }
}
