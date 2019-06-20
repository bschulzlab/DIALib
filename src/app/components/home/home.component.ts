import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ElectronService} from '../../providers/electron.service';
import {TranslateService} from '@ngx-translate/core';
import {AnnoucementService} from '../../helper/annoucement.service';
import {ConnectorService} from '../../helper/connector.service';
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";
import {SwathResultService} from "../../helper/swath-result.service";
import {FileService} from "../../providers/file.service";
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
      trigger('openClose', [
          state('open', style({
             bottom: '50px',
          })),
          state('closed', style({
            bottom: '-80px',
          })),
          transition('open => closed', [
              animate(500)
          ]),
          transition('closed => open', [
              animate(500)
          ])
      ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  annoucement: Observable<string>;
  collapsed = true;
  serverStatus: Observable<boolean>;
  sidebarSelect: Subscription;
  selected = 1;
  finishedTime;
  finished;
  downloadPopupState = 'closed';
  finishedSub: Subscription;
  constructor(public electronService: ElectronService, private srs: SwathResultService, private fileService: FileService,
              private translate: TranslateService, private anSer: AnnoucementService, private connector: ConnectorService, private helper: SwathLibHelperService) {
    this.annoucement = this.anSer.annoucementReader;
    this.finishedTime = this.srs.finishedTime;
  }

  ngOnInit() {
    this.sidebarSelect = this.helper.selectSidebarObservable.subscribe((data) => {
      this.selected = data;
    });
    this.finishedSub = this.srs.finishedTrigger.subscribe((data) => {
      this.finished = data;
      console.log(this.finished);
      if (data) {
        this.finishedTime = this.srs.getCurrentDate();
        this.downloadPopupState = 'open';
      } else {
        this.downloadPopupState = 'closed';
      }
    })
  }

  ngOnDestroy(): void {
    this.sidebarSelect.unsubscribe();
    this.finishedSub.unsubscribe();
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  OpenConnectorModal() {
      this.electronService.ipcRenderer.send("window-open", {options:{width: 700, height: 500, center: true, frame: true, transparent: false}, url: `file://${__dirname}/index.html#/` + 'connector'});
/*    const BrowserWindow = this.electronService.remote.BrowserWindow;
    const win = new BrowserWindow({
      width: 700,
      height: 500,
      center: true,
      // resizable: false,
      frame: true,
      transparent: false,
    });
    win.loadURL(`file://${__dirname}/index.html#/` + 'connector');*/
  }

  updateRT(data) {
    this.helper.updateRT(data);
  }
  downloadFile() {
    let count = 0;
    if (window.location.protocol === 'file:') {
      this.anSer.Announce('Saving...');
      const picked = this.fileService.save('txt');
      const fileWriter = this.electronService.fs.createWriteStream(picked);
      let writeHeader = false;
      for (const r of this.srs.resultCollection) {
        count++;
        if (r.header !== undefined) {
          if (writeHeader === false) {
            fileWriter.write(r.header.join('\t') + '\n');
            writeHeader = true;
          }
          if (r.data.constructor === Array) {
            if (r.data.length > 0) {
              for (const row of r.data) {
                if (row.row !== undefined) {
                  fileWriter.write(row.row.join('\t') + '\n');
                }
              }
            }
          }
        }
      }
      fileWriter.end();
    }
    this.anSer.Announce('Finished.');
  }

  changeState() {
    if (this.downloadPopupState == 'open') {
      this.downloadPopupState = 'closed';
    } else {
      this.downloadPopupState = 'open';
    }
  }
}
