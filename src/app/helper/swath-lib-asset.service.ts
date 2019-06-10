import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {StaticMod} from './static-mod';
import {VariableMod} from './variable-mod';
import {Modification} from './modification';
import {BehaviorSubject} from 'rxjs';
import {SwathWindows} from './swath-windows';
import {Oxonium} from './oxonium';
import {BaseUrl} from './base-url';
import {SeqCoordinate} from './seq-coordinate';
import {DigestRule} from './digest-rule';


@Injectable()
export class SwathLibAssetService {
  private _staticModsSource = new BehaviorSubject<Modification[]>(null);
  private _variableModsSource = new BehaviorSubject<Modification[]>(null);
  private _YtypeModsSource = new BehaviorSubject<Modification[]>(null);
  private _windowsSource = new BehaviorSubject<SwathWindows[]>(null);
  private _oxoniumSource = new BehaviorSubject<Oxonium[]>(null);
  private _resultSource = new Subject<SwathResponse>();
  staticMods = this._staticModsSource.asObservable();
  variableMods = this._variableModsSource.asObservable();
  YtypeMods = this._YtypeModsSource.asObservable();
  windowsReader = this._windowsSource.asObservable();
  result = this._resultSource.asObservable();
  oxoniumReader = this._oxoniumSource.asObservable();
  url = new BaseUrl();
  private URL = this.url.url + ':9000/api/swathlib/upload/';
  private resultURL = this.url.url + ':9000/api/swathlib/result/';
  private _statusSource = new BehaviorSubject<boolean>(false);
  statusReader = this._statusSource.asObservable();
  private _digestRulesSource = new BehaviorSubject<DigestRule[]>(null);
  digestRulesReader = this._digestRulesSource.asObservable();
  constructor(private http: HttpClient) { }

  getAssets(url, assetType = 'json') {
    if (assetType === 'json') {
      return this.http.get(url, {observe: 'response'});
    } else if (assetType === 'text') {
      return this.http.get(url, {observe: 'response', responseType: 'text'});
    }
  }

  updateDigestRules(data) {
    this._digestRulesSource.next(data);
  }

  uploadForm(form: FormData) {
    console.log(form);
    return this.http.post(this.URL, form);
  }

  updateMods(data) {
    const sMod = [];
    const vMod = [];
    const YMod = [];
    for (const m of data) {
      switch (m.type) {
        case 'static':
          sMod.push(m);
          break;
        case 'variable':
          vMod.push(m);
          break;
        case 'Ytype':
          YMod.push(m);
          break;
      }
    }
    this.updateStaticMods(sMod);
    this.updateVariableMods(vMod);
    this.updateYtypeMods(YMod);
  }

  updateStaticMods(data) {
    this._staticModsSource.next(data);
  }

  updateVariableMods(data) {
    this._variableModsSource.next(data);
  }

  updateYtypeMods(data) {
    this._YtypeModsSource.next(data);
  }
  updateResult(s) {
    s.url = this.resultURL + s.fileName;
    console.log(s);
    this._resultSource.next(s);
  }

  updateWindows(data) {
    this._windowsSource.next(data);
  }

  updateOxonium(data) {
    this._oxoniumSource.next(data);
  }

  checkServerExist() {
    return this.http.get(this.URL, {observe: 'response'});
  }

  updateServerStatus(data) {
    this._statusSource.next(data);
  }
}

export class SwathResponse {
  get url(): string {
    return this._url;
  }

  set url(value: string) {
    this._url = value;
  }
  constructor(fileName: string) {
    this._fileName = fileName;
  }
  get fileName(): string {
    return this._fileName;
  }

  set fileName(value: string) {
    this._fileName = value;
  }
  private _fileName: string;
  private _url: string;
}
