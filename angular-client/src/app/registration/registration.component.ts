import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatStepper, StepperOrientation } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsersService } from 'src/services/users.service';
import { IuserRegistrationDetail } from 'src/interfaces/user';
import { CustomValidatorsService } from 'src/services/custom-validators.service';
import { ErrorsService } from 'src/services/errors.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit, AfterViewInit {
  stepperOrientation: Observable<StepperOrientation>;
  @ViewChild(MatStepper) stepper!: MatStepper;
  hidePassword = true;
  hideConfirmPassword = true;
  registrationFormStep1!: FormGroup;
  registrationFormStep2!: FormGroup;
  email!: string;
  token!: string;
  errorMessage = this.errors.getErrorMessage;
  serverError!: string;
  constructor(
    private _formBuilder: FormBuilder,
    breakpointObserver: BreakpointObserver,
    private usersService: UsersService,
    private customValidators: CustomValidatorsService,
    private route: ActivatedRoute,
    private router: Router,
    private errors: ErrorsService
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  private setStepByFragment(): void {
    const stepName = this.route.snapshot.fragment;
    if (stepName) {
      const stepIndex = this.switchLabelToStepIndex(stepName);
      if (stepIndex !== -1) {
        this.stepper.selectedIndex = stepIndex;
      }
    } else {
      this.router.navigate(['register'], { fragment: 'Step 1' });
    }
  }

  private updateFragmentOnStepChange(): void {
    this.stepper.selectionChange.subscribe((change) => {
      const stepName = change.selectedStep?.label;
      if (stepName) {
        this.router.navigate(['register'], { fragment: stepName });
      }
    });
  }

  private switchLabelToStepIndex(label: string): number {
    return this.stepper._steps
      .toArray()
      .findIndex((step) => step.label === label);
  }
  ngOnInit() {
    this.registrationFormStep1 = this._formBuilder.group(
      {
        email: [
          '',
          {
            validators: [Validators.required, Validators.email],
            asyncValidators: [
              this.customValidators.emailExistsValidator.bind(this),
            ],
            updateOn: 'blur',
          },
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(18),
            this.customValidators.passwordComplexityValidator,
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.customValidators.passwordMatchValidator }
    );
    this.registrationFormStep2 = this._formBuilder.group({
      city: ['', Validators.required],
      street: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
    });
  }
  ngAfterViewInit(): void {
    this.setStepByFragment();
    this.updateFragmentOnStepChange();
  }

  goHome() {
    this.usersService.setUserAccessData(this.email, this.token, true);
    this.router.navigate([''], { replaceUrl: true });
  }
  register() {
    const user: IuserRegistrationDetail = {
      firstName: this.registrationFormStep2.get('firstName')?.value,
      lastName: this.registrationFormStep2.get('lastName')?.value,
      email: this.registrationFormStep1.get('email')?.value,
      password: this.registrationFormStep1.get('password')?.value,
      billingAddress: {
        city: this.registrationFormStep2.get('city')?.value,
        street: this.registrationFormStep2.get('street')?.value,
      },
    };
    this.usersService.register(user).subscribe({
      next: (data) => {
        this.email = data.user.email;
        this.token = data.token;
        this.stepper.next();
      },
      error: (error) => {
        if (error.error === 'invalid role' && error.status === 400) {
          this.setFormError(this.registrationFormStep2, 'invalidRole', true);
          this.serverError = error.error;
        }
        if (error.status === 403 || error.status === 401) {
          this.usersService.logout();
          this.router.navigate(['login'], { replaceUrl: true });
        }
      },
    });
  }

  setFormError(formGroup: FormGroup, errorName: string, errorValue: boolean) {
    formGroup.setErrors({ [errorName]: errorValue });
  }
}
