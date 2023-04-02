import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Iproduct, IupdateProduct } from 'src/interfaces/product';
import { ProductService } from 'src/services/products.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IuserDetail } from 'src/interfaces/user';
import { UsersService } from 'src/services/users.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidatorsService } from 'src/services/custom-validators.service';
import { ErrorsService } from 'src/services/errors.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  @ViewChild('dialogTemplate', { static: true })
  dialogTemplate!: TemplateRef<any>;
  @Output() showSnackbar = new EventEmitter<void>();
  dialogRef!: MatDialogRef<any>;
  selectedFile: File | null = null;
  addProductForm!: FormGroup;
  user!: IuserDetail;
  token!: string;
  errorMessage = this.errors.getErrorMessage;
  serverError!: string;
  categories: string[] = [];
  confirmed = false;

  constructor(
    private _formBuilder: FormBuilder,
    private customValidators: CustomValidatorsService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private productsService: ProductService,
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

    this.addProductForm = this._formBuilder.group({
      name: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(999)]],
      price: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      category: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    if (file) {
      const res = this.customValidators.checkFile(file);
      switch (true) {
        case res?.['fileType']:
          this.addProductForm.controls['image'].setErrors({ fileType: true });
          break;
        case res?.['fileSize']:
          this.addProductForm.controls['image'].setErrors({ fileSize: true });
          break;
      }
      if (res?.['fileType']) {
      }
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }
  openDialog(dialogTemplateRef: TemplateRef<any>, category: string) {
    this.dialogRef = this.dialog.open(dialogTemplateRef, {
      width: '500px',
    });
  }
  confirmNewCategory() {
    if (this.addProductForm.get('category')?.hasError('categoryExists')) {
      this.addProductForm.get('category')?.setErrors(null);
      this.productsService.setProductStatus(true);
      this.dialog.closeAll();
    }
  }

  addProduct() {
    this.productsService.getProducts().subscribe((products) => {
      Object.entries(products)[0][1].forEach((product: Iproduct) => {
        if (!this.categories.includes(product.category)) {
          this.categories.push(product.category);
        }
      });
      if (
        !this.categories.includes(this.addProductForm.get('category')?.value)
      ) {
        this.addProductForm
          .get('category')
          ?.setErrors({ categoryExists: true });
        this.openDialog(
          this.dialogTemplate,
          this.addProductForm.get('category')?.value
        );
      } else {
        this.productsService.setProductStatus(true);
      }
    });
    this.productsService.productsState$.subscribe((state) => {
      if (this.addProductForm.valid && state.productUpdated) {
        const productData: Omit<Iproduct, 'productId'> = {
          name: this.addProductForm.get('name')?.value,
          description: this.addProductForm.get('description')?.value,
          category: this.addProductForm.get('category')?.value,
          price: this.addProductForm.get('price')?.value,
          imageData: this.selectedFile!,
        };
        this.productsService.addProduct(productData, this.token).subscribe({
          next: (data: Iproduct) => {
            this.router.navigate(['admin', 'edit-products'], {
              replaceUrl: true,
            });
          },
          error: (error: any) => {
            console.error(error);
            switch (true) {
              case error.status === 403 || error.status === 401:
                this.usersService.logout();
                this.router.navigate(['login'], { replaceUrl: true });
                if (error.status === 403) this.showSnackbar.emit();
                return;
              case error.status === 400 &&
                error.error.includes('already exists'):
                this.serverError = error.error;
                this.addProductForm
                  .get('name')
                  ?.setErrors({ serverError: true });
                return;
            }
          },
        });
      }
    });
  }
}
