import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorsService } from 'src/services/errors.service';
import { UsersService } from 'src/services/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  hide = true;
  loginForm!: FormGroup;
  serverError!: string;
  errorMessage = this.errors.getErrorMessage;
  constructor(
    private _formBuilder: FormBuilder,
    private usersService: UsersService,
    private router: Router,
    private errors: ErrorsService
  ) {}
  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'auto' });
    this.loginForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  login() {
    this.usersService.login(this.loginForm.value).subscribe({
      next: (data) => {
        this.usersService.setUserAccessData(data.user.email, data.token, true);
        this.router.navigate([''], { replaceUrl: true });
      },
      error: (error) => {
        if (error.status === 403 || error.status === 401) {
          this.usersService.logout();
          this.router.navigate(['login'], { replaceUrl: true });
        }
        this.serverError = error.error;
        this.loginForm.get('password')?.setErrors({ serverError: true });
      },
    });
  }
}
