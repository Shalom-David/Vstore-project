import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IuserDetail, IuserUpdateDetail } from 'src/interfaces/user';
import { CustomValidatorsService } from 'src/services/custom-validators.service';
import { ErrorsService } from 'src/services/errors.service';
import { UsersService } from 'src/services/users.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  user!: IuserDetail;
  token!: string;
  editProfileForm!: FormGroup;
  edit = false;
  hidePassword = true;
  hideConfirmPassword = true;
  errorMessage = this.errors.getErrorMessage;
  userUpdated = false;
  constructor(
    private usersService: UsersService,
    private _formBuilder: FormBuilder,
    private customValidators: CustomValidatorsService,
    private errors: ErrorsService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.usersService.userAccessData$.subscribe((userData) => {
      if (userData.customerEmail && userData.token && userData.loggedIn) {
        this.usersService
          .getUser(userData.customerEmail, userData.token)
          .subscribe({
            next: (userDetail) => {
              this.user = userDetail;
              this.token = userData.token;
            },
            error: (error) => {
              if (error.status === 403 || error.status === 401) {
                this.usersService.logout();
                this.router.navigate(['login'], { replaceUrl: true });
              }
            },
          });
      }
    });

    this.editProfileForm = this._formBuilder.group(
      {
        email: [
          '',
          {
            validators: [Validators.email],
            asyncValidators: [
              this.customValidators.emailExistsValidator.bind(this),
            ],
            updateOn: 'blur',
          },
        ],
        password: [
          '',
          [
            Validators.minLength(8),
            Validators.maxLength(18),
            this.customValidators.passwordComplexityValidator,
          ],
        ],
        confirmPassword: [''],
        city: [''],
        street: [''],
        firstName: [''],
        lastName: [''],
      },

      { validators: this.customValidators.passwordMatchValidator }
    );
  }

  toggleProfileEdit(edit: boolean) {
    this.edit = edit;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  saveProfileChanges() {
    const filledFormValues = this.getFormValues(this.editProfileForm);
    const hasValues = Object.keys(filledFormValues).length !== 0;
    if (hasValues) {
      this.usersService
        .editUserProfile(this.user.email, this.token, filledFormValues)
        .subscribe({
          next: (data) => {
            if (
              this.user.password !== data.password ||
              this.user.email !== data.email
            ) {
              this.usersService.logout();
              this.router.navigate(['/login'], { replaceUrl: true });
            } else {
              this.user = data;
              this.usersService.setUserAccessData(
                this.user.email,
                this.token,
                true
              );
            }
          },
          error: (error) => {
            if (error.status === 403 || error.status === 401) {
              this.usersService.logout();
              this.router.navigate(['login'], { replaceUrl: true });
            }
          },
        });
      this.editProfileForm.patchValue({
        email: '',
        password: '',
        confirmPassword: '',
        city: '',
        street: '',
        firstName: '',
        lastName: '',
      });
      this.edit = false;
    }
  }

  private getFormValues(form: FormGroup) {
    const formValues = form.value;
    const result: Partial<IuserUpdateDetail> = {};

    let billingAddress: { city?: string; street?: string } = {};

    for (const key in formValues) {
      if (
        formValues.hasOwnProperty(key) &&
        formValues[key] !== '' &&
        formValues[key] !== null &&
        key !== 'confirmPassword'
      ) {
        if (key === 'city' || key === 'street') {
          billingAddress[key] = formValues[key];
        } else {
          (result as any)[key] = formValues[key];
        }
      }
    }

    if (Object.keys(billingAddress).length > 0) {
      result.billingAddress = billingAddress;
    }

    return result;
  }
}
