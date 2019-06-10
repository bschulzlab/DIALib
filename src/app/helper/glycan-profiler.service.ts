import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {GppResult} from "./gpp-result";
import {BaseUrl} from "./base-url";

@Injectable()
export class GlycanProfilerService {
  url = new BaseUrl();
  private URL = this.url.url + ':9001/';
  // private URL = 'http://localhost:9001/';
  private _resultSource = new Subject<GppResult[]>();
  resultReader = this._resultSource.asObservable();
  constructor(private http: HttpClient) { }

  postFormData(f: FormData) {
    return this.http.post(this.URL + 'api/gpp/upload/', f, {observe: 'response'});
  }

  updateResult(data) {
    for (const d of data) {
      d.url = this.URL + 'static/' + d.filename;
    }
    this._resultSource.next(data);
  }
}
