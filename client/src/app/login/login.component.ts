import { Component } from "@angular/core";
import {
  AuthenticationService,
  TokenPayload,
  UserDetails,
} from "../authentication.service";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Component({
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  credentials: TokenPayload = {
    email: "",
    password: "",
  };
  emailForPassword;
  message;
  emailSendSuccesfully;
  wrongPassword;
  constructor(
    private auth: AuthenticationService,
    private router: Router,
    private http: HttpClient
  ) {}

  login() {
    this.auth.login(this.credentials).subscribe(
      () => {
        this.router.navigateByUrl("/profile");
      },
      (err) => {
        console.error(err.error.message);
        this.wrongPassword = err.error.message;
      }
    );
  }

  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  mailPassword() {
    this.http
      .post(
        "/api/forgotPassword",
        JSON.stringify({ email: this.emailForPassword }),
        this.httpOptions
      )
      .subscribe(
        (res: any) => {
          if (res.message) {
            this.message = res.message;
            this.emailSendSuccesfully = true;
          }
        },
        (err) => {
          if (err.error) {
            this.message = err.error.message;
            this.emailSendSuccesfully = false;
          }
        }
      );
    // this.router.navigateByUrl('/newCourse');
  }
}
