import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IcartData, IcartProduct } from 'src/interfaces/cart';
@Injectable({
  providedIn: 'root',
})

export class StatesService {
  private state = {
    selectedOption: '',
    selectedSearchOption: '',
  };
  // private cartProducts = new BehaviorSubject<IcartProduct[]>([]);
  state$ = new BehaviorSubject(this.state);

  constructor() {}

  setSelectedOption(option: string) {
    this.state.selectedOption = option;
    this.state$.next(this.state);
  }

  setSelectedSearchOption(option: string) {
    this.state.selectedSearchOption = option;
    this.state$.next(this.state);
  }
}
