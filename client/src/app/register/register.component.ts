import { Component } from "@angular/core";
import { AuthenticationService, TokenPayload } from "../authentication.service";
import { Router } from "@angular/router";

@Component({
  templateUrl: "./register.component.html",
})
export class RegisterComponent {
  credentials: TokenPayload = {
    email: "",
    name: "",
    password: "",
    faculty: false,
  };
  wrongPassword = false;
  constructor(private auth: AuthenticationService, private router: Router) {}

  register() {
    this.auth.register(this.credentials).subscribe(
      () => {
        this.router.navigateByUrl("/profile");
      },
      (err) => {
        if (err.error === "password") {
          this.wrongPassword = true;
        }
        console.error(err);
      }
    );
  }
}
