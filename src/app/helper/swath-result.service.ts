import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {SwathQuery} from './swath-query';
import {DataStore} from './data-row';
import {BaseUrl} from './base-url';
import {ConnectorService} from './connector.service';

@Injectable()
export class SwathResultService {
  resultCollection = [];
  finishedTime;
  finished;
  collectTrigger;
  private _outputSource = new Subject<DataStore>();
  OutputReader = this._outputSource.asObservable();
  private _sendTrigger = new Subject<boolean>();
  sendTriggerReader = this._sendTrigger.asObservable();
  private _finishedTrigger = new BehaviorSubject<boolean>(false);
  finishedTrigger = this._finishedTrigger.asObservable();
  url = new BaseUrl();
  constructor(private http: HttpClient, private connector: ConnectorService) { }
  private URL =  this.url.url + ':9000/api/swathlib/upload/';
  // private URL = 'http://localhost:9000/api/swathlib/upload/';
  UpdateOutput(data) {
    this._outputSource.next(data);
  }

  SendQuery(data: SwathQuery) {
    for (const m of data.modifications) {
      for (const key in m) {
        if (m[key].hasOwnProperty()) {
          m[key] = m[key];
        }
      }
    }
    const q = data.toJsonable();
    console.log(q);
    const url = this.connector.GetURL().url.url + '/api/swathlib/upload/';
    console.log('sending request to ' + url);
    return this.http.put(url, q, {observe: 'response'});
  }

  UpdateSendTrigger(data) {
    this._sendTrigger.next(data);
  }

  getCurrentDate() {
    return Date.now();
  }

  UpdateFinishTrigger(data) {
    this._finishedTrigger.next(data);
  }
}
