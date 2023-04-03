import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ErrorsService {
  constructor() {}

  getErrorMessage(
    formGroup: FormGroup,
    controlName: string,
    serverError?: any
  ) {
    const control = formGroup.controls[controlName];
    switch (true) {
      case control.hasError('required') && controlName !== 'image':
        return 'You must enter a value';
      case controlName === 'email' && control.hasError('email'):
        return 'Not a valid Email';
      case controlName === 'email' && control.hasError('emailExists'):
        return 'email already in use';
      case controlName === 'password' && control.hasError('minlength'):
        return 'Password must be at least 8 characters';
      case controlName === 'password' && control.hasError('maxlength'):
        return 'Password must not exceed 18 characters';
      case controlName === 'description' && control.hasError('maxlength'):
        return 'Description must not exceed 999 characters';
      case controlName === 'password' && control.hasError('passwordComplexity'):
        return 'Password must contain at least one uppercase letter, lowercase letter, and one number';
      case controlName === 'confirmPassword' &&
        control.hasError('passwordMismatch'):
        return 'passwords do not match';
      case controlName === 'password' &&
        serverError &&
        control.hasError('serverError'):
        return serverError;
      case control.hasError('pattern'):
        return 'invalid format';
      case control.hasError('dateNotBeforeToday'):
        return 'date cannot be before today';
      case controlName === 'image' && control.hasError('fileType'):
        return 'File type must be one of jpeg, jpg, png, gif, svg';
      case controlName === 'image' && control.hasError('fileSize'):
        return 'File size cannot exceed 1MB';
      case controlName === 'image' && control.hasError('required'):
        return '**Image required';
      case controlName === 'name' &&
        serverError &&
        control.hasError('serverError'):;
        return serverError;
      case controlName === 'category' && control.hasError('categoryNotExist'):
        return 'category not found';
      default:
        return '';
    }
  }
}
