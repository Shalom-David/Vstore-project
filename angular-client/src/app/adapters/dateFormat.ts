import { NativeDateAdapter, MatDateFormats } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { Platform } from '@angular/cdk/platform';

export class CustomDateAdapter extends NativeDateAdapter {
  constructor(private datePipe: DatePipe, matDateLocale: string, dateFormats: Platform) {
    super(matDateLocale, dateFormats);
  }

  override format(date: Date, displayFormat: Object): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy') || '';
  }

  override parse(value: any): Date | null {
    const dateParts = value.split('/');
    if (dateParts.length === 3) {
      const [month, day, year] = dateParts.map(Number);
      return new Date(year, month - 1, day);
    }

    return null;
  }
}
