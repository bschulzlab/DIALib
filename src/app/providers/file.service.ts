import {Injectable} from '@angular/core';
import * as path from 'path';
import {ElectronService} from './electron.service';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  get userDataPath(): string {
    return this._userDataPath;
  }

  set userDataPath(value: string) {
    this._userDataPath = value;
  }

  private remote;
  private _userDataPath: string;
  private _recentJob: BehaviorSubject<Storage> = new BehaviorSubject<Storage>(null);
  recentJobReader = this._recentJob.asObservable();

  constructor(private electron: ElectronService) {
    this.remote = this.electron.remote;
    this._userDataPath = this.remote.app.getPath('userData');
  }



  save(extension = '') {
    const {dialog} = this.electron.remote;
    if (extension !== '') {
      return dialog.showSaveDialog(this.remote.getCurrentWindow(), {filters: [{name: 'Text SWATH Library File', extensions: [extension]}]});
    } else {
      return dialog.showSaveDialog(this.remote.getCurrentWindow());
    }

  }

  pickFile() {
    const {dialog} = this.electron.remote;
    return dialog.showOpenDialog({properties: ['openFile']});
  }
}
