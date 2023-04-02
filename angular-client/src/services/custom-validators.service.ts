import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class CustomValidatorsService {
  constructor(private usersService: UsersService) {}

  passwordComplexityValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.value;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password && (!hasUpperCase || !hasLowerCase || !hasNumber)) {
      return { passwordComplexity: true };
    }

    return null;
  }
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }

    return null;
  }

  emailExistsValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return this.usersService.checkExistingEmail({ email: control.value }).pipe(
      map((emailExists) => {
        return emailExists ? { emailExists: true } : null;
      })
    );
  }

  dateNotBeforeTodayValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only the date part

    if (selectedDate < today) {
      return { dateNotBeforeToday: true };
    }
    return null;
  }

  checkFile(file: File | null): ValidationErrors | null {
    if (!file) {
      return null;
    }
    console.log(file);
    const fileTypes = /jpeg|jpg|png|gif|svg/;
    const extName = fileTypes.test(
      file.name.toLowerCase().split('.').pop() || ''
    );
    const mimeType = fileTypes.test(file.type);
    if (file.size > 1048576) {
      return { fileSize: true };
    }

    if (!mimeType || !extName) {
      return { fileType: true };
    }

    return null;
  }
}
