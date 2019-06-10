import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ConnectorService} from '../../helper/connector.service';
import {Observable, Subscription} from 'rxjs';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ConnectorUrl} from '../../helper/connector-url';
import {ElectronService} from "../../providers/electron.service";
import {Backend} from "../../helper/backend";

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss']
})
export class ConnectorComponent implements OnInit, OnDestroy {
  connectorSignal: Observable<boolean>;
  signalSub: Subscription;
  ref: NgbModalRef;
  urls;
    urlStatusMap: Map<string, ConnectorUrl> = new Map<string, ConnectorUrl>();
  localServerSettings = [{pythonPath: 'python', port: "9000", status: false, url: new ConnectorUrl('', false)}];
  backend;
  backendObs: Observable<Backend[]>;
  constructor(private connector: ConnectorService, private electron: ElectronService) {
    this.connectorSignal = this.connector.connectorModalSignal;
    this.urls = this.connector.urls;
    const ipcRenderer = this.electron.ipcRenderer;
    this.backendObs = this.connector.connectorSourceReader;
    ipcRenderer.on('backend-close', (event, arg) => {
        for (let i = 0; i <= this.localServerSettings.length; i++) {
            if (this.localServerSettings[i].port === arg.port) {
                this.localServerSettings[i].status = false;
            }
        }
    });
  }

  ngOnInit() {


    /*this.signalSub = this.connectorSignal.subscribe((data) => {
      if (data) {
        this.ref = this.modal.open(this.serverConnection);
        for (const c of this.urls) {
          this.checkUrl(c.url);
        }
      } else {
        if (this.ref !== undefined) {
          this.ref.dismiss();
        }
      }
    });*/
  }

  checkUrl(u: ConnectorUrl) {
      this.urlStatusMap.set(u.url, u);
    this.connector.CheckURL(u.url).subscribe((resp) => {
        this.electron.notify({title: 'SWATHLib Connection Status', message: 'Successfully connected to ' + u.url});
      this.urlStatusMap.get(u.url).status = resp['status'] === 200;
    }, (err) => {
        this.electron.notify({title: 'SWATHLib Connection Status', message: 'Successfully connected to ' + u.url});
      this.urlStatusMap.get(u.url).status = false;
    });
  }

  AddURL(current) {
      this.connector.AddURL(current);
  }

  RemoveURL(tobeRemoved, current) {
        this.connector.RemoveURL(tobeRemoved, current);
  }

  ngOnDestroy() {
    this.signalSub.unsubscribe();
  }

  SaveUrls(urls) {
      this.electron.notify({title: 'SWATHLib Connections', message: 'Connections Collection Saved!'});
    this.connector.UpdateURLs(urls);
  }

  StartBackend(backend) {
      this.electron.ipcRenderer.send('backend-start', backend);
  }
}
