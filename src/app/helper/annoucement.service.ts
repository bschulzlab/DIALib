import { Injectable } from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable()
export class AnnoucementService {
  private _annoucementSource = new BehaviorSubject<string>('Welcome');
  annoucementReader = this._annoucementSource.asObservable();
  private errorSource = new Subject<boolean>();
  errorReader = this.errorSource.asObservable();
  constructor() { }

  Announce(data: string) {
    this._annoucementSource.next(data);
  }

  AnnounceError(data: boolean) {
    this.errorSource.next(data);
  }
}
