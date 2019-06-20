import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Subject} from 'rxjs';
import {ConnectorUrl} from './connector-url';
import {ElectronService} from "../providers/electron.service";
import {Backend} from "./backend";


@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  urls = [
      new Backend('python', "9000", false, new ConnectorUrl('http://10.89.221.27:9000', false))
  ];
  previousUrlIndex = -1;
  connectMap = new Map<string, boolean>();
  private connectorModal = new Subject<boolean>();
  connectorModalSignal = this.connectorModal.asObservable();
  private connectorSource = new BehaviorSubject<Backend[]>(this.urls);
  connectorSourceReader = this.connectorSource.asObservable();

    urlStatusMap: Map<string, ConnectorUrl> = new Map<string, ConnectorUrl>();
  constructor(private http: HttpClient, private electron: ElectronService) {
      this.GetBaseURL();

      this.electron.ipcRenderer.on('reply-backend-get', (event, args) => {
          this.urlStatusMap = new Map<string, ConnectorUrl>();

          if (args.length > 0) {
              for (let i = 0; i < args.length; i ++) {
                  this.urlStatusMap.set(args[i].url.url, args[i].url);
              }
              for (let i = 0; i < args.length; i ++) {
                  this.checkUrl(args[i].url)
              }
              this.urls = args;
              this.UpdateConnectorSource(args);
          }
      });
  }

  GetBaseURL() {
      this.electron.ipcRenderer.send('backend-get', true);
  }

  UpdateURLs(urls: Backend[]) {
    this.urls = urls;
    this.electron.ipcRenderer.send('backend-update', urls);
    console.log(this.urls);
  }

  AddURL(current) {
      current.push(new Backend('python', "9000", false, new ConnectorUrl('', false)));
      this.UpdateConnectorSource(current);
  }

  RemoveURL(toBeRemoved: Backend, current: Backend[]) {
      const ind = current.indexOf(toBeRemoved);
      if (current.length === 1) {
          current[ind].url = new ConnectorUrl('', false);
      } else {
          current.splice(ind, 1);
      }
      this.UpdateConnectorSource(current);
  }

  UpdateConnectorSource(data) {
      this.connectorSource.next(data);
  }
    checkUrl(u: ConnectorUrl) {
        /*if (!this.urlStatusMap.has(u.url)) {

        }*/
        this.urlStatusMap.set(u.url, u);
        this.CheckURL(u.url).subscribe((resp) => {
            this.urlStatusMap.get(u.url).status = resp['status'] === 200;
        }, (err) => {
            this.urlStatusMap.get(u.url).status = false;
        });
    }

  CheckURL(u: string) {
    console.log(u);

    return this.http.get(u + '/api/swathlib/upload/', {observe: 'response'});
  }


  SendModalSignal(data: boolean) {
    this.connectorModal.next(data);
  }

  GetURL(checkStatus: boolean = false) {

    while (this.previousUrlIndex >= -1 && this.previousUrlIndex < this.urls.length - 1) {
        console.log(this.previousUrlIndex);
        this.previousUrlIndex ++;

        if (checkStatus) {
          if (this.urls[this.previousUrlIndex]) {
            return this.urls[this.previousUrlIndex];
          }
        } else {
          return this.urls[this.previousUrlIndex];
        }
    }
    this.previousUrlIndex = -1;
    return this.urls[0];
  }
}
