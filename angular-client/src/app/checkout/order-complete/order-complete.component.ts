import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Iorder } from 'src/interfaces/order';
import { DownloadReceiptService } from 'src/services/download-receipt.service';

@Component({
  selector: 'app-order-complete',
  templateUrl: './order-complete.component.html',
  styleUrls: ['./order-complete.component.css'],
})
export class OrderCompleteComponent {
  @Input() order!: Iorder;
  constructor(
    private router: Router,
    private downloadReceiptService: DownloadReceiptService
  ) {}

  goHome() {
    this.router.navigate([''], { replaceUrl: true });
  }

  downloadReceipt(order: Iorder) {
    this.downloadReceiptService.downloadReceipt(order);
    this.router.navigate([''], { replaceUrl: true });
  }
}
