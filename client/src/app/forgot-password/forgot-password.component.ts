import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Component({
  selector: "forgot-password",
  templateUrl: "./forgot-password.component.html",
})
export class ForgotPasswordComponent {
  password: string;
  confirmPassword: string;
  invalidToken: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  resetPassword = () => {
    this.route.params.subscribe(({ token }) => {
      if (!token) {
        this.invalidToken = true;
        return;
      }

      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
      }
      console.log("token", token);
      console.log("this.password", this.password);
      this.http
        .post("api/resetPassword", { token, password: this.password })
        .subscribe((res) => {
          if (!res) {
            alert(
              "There was an error resetting your password. Please try again."
            );
          } else {
            alert(
              "Your password has been reset successfully. Please login with your new password."
            );
            this.router.navigate(["/login"]);
          }
        });
    });
  };
}
