import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { first } from 'rxjs';
import { Iproduct, IupdateProduct } from 'src/interfaces/product';
import { ProductService } from 'src/services/products.service';
import { Buffer } from 'buffer';
import { StatesService } from 'src/services/states.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { IuserDetail } from 'src/interfaces/user';
import { UsersService } from 'src/services/users.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidatorsService } from 'src/services/custom-validators.service';
import { ErrorsService } from 'src/services/errors.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css'],
})
export class EditProductComponent implements OnInit {
  @ViewChild('dialogRef') dialogTemplateRef!: TemplateRef<any>;
  @Output() showSnackbar = new EventEmitter<void>();
  panelOpenState = false;
  private category!: string;
  private searchQuery!: string;
  dialogRef!: MatDialogRef<any>;
  products!: Iproduct[];
  selectedProduct!: Iproduct;
  user!: IuserDetail;
  token!: string;
  editProductForm!: FormGroup;
  selectedFile: File | null = null;
  errorMessage = this.errors.getErrorMessage;
  constructor(
    private productsService: ProductService,
    private statesService: StatesService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private customValidators: CustomValidatorsService,
    private errors: ErrorsService,
    private router: Router
  ) {}

  openDialog(dialogTemplateRef: TemplateRef<any>, product: Iproduct) {
    this.dialogRef = this.dialog.open(dialogTemplateRef, {
      width: '500px',
    });
    this.selectedProduct = product;
    this.editProductForm = this._formBuilder.group({
      name: [product ? product.name : ''],
      description: [
        product ? product.description : '',
        [Validators.maxLength(999)],
      ],
      price: [product ? product.price : ''],
      category: [product ? product.category : ''],
      image: [''],
    });
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    if (file) {
      const res = this.customValidators.checkFile(file);
      switch (true) {
        case res?.['fileType']:
          this.editProductForm.controls['image'].setErrors({ fileType: true });
          break;
        case res?.['fileSize']:
          this.editProductForm.controls['image'].setErrors({ fileSize: true });
          break;
      }
      if (res?.['fileType']) {
      }
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  updateProduct() {
    const productData: IupdateProduct = {
      productId: this.selectedProduct?.productId,
      name: this.editProductForm.get('name')?.value,
      description: this.editProductForm.get('description')?.value,
      category: this.editProductForm.get('category')?.value,
      price: this.editProductForm.get('price')?.value,
      imageData: this.selectedFile || null,
    };

    this.productsService.updateProduct(productData, this.token).subscribe({
      next: () => {
        this.productsService.setProductStatus(true);
        this.dialog.closeAll();
      },
      error: (error: any) => {
        if (error.status === 403 || error.status === 401) {
          this.usersService.logout();
          this.router.navigate(['login'], { replaceUrl: true });
          if (error.status === 403) this.showSnackbar.emit();
        }
      },
    });
  }
  ngOnInit(): void {
    this.statesService.state$.subscribe((state) => {
      this.category = state.selectedOption;
      this.searchQuery = state.selectedSearchOption;
      this.products = [];
      this.productsService.productsState$.subscribe((state) => {
        if (state.productUpdated) {
          this.subscribeToProducts(this.category, undefined, this.searchQuery);
        }
      });

      this.usersService.userAccessData$.subscribe((userData) => {
        if (userData.customerEmail && userData.token && userData.loggedIn) {
          this.usersService
            .getUser(userData.customerEmail, userData.token)
            .subscribe({
              next: (userDetail) => {
                this.subscribeToProducts(
                  this.category,
                  undefined,
                  this.searchQuery
                );
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
    });
  }

  subscribeToProducts(category?: string, page?: number, searchQuery?: string) {
    this.productsService
      .getProducts(category, page, searchQuery)
      .pipe(first())
      .subscribe({
        next: (data) => {
          this.products = Object.entries(data)[0][1];
        },
        error: (error: any) => {
          if (error.status === 403 || error.status === 401) {
            this.usersService.logout();
            this.router.navigate(['login'], { replaceUrl: true });
          }
        },
      });
  }
}
