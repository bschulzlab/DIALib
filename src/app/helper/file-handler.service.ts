import { Injectable } from '@angular/core';
import {DataRow, DataStore} from './data-row';
import {Observable} from 'rxjs';
import {Subject} from 'rxjs';
import * as FileSaver from 'file-saver';
import * as StreamSaver from 'streamsaver';
import {AnnoucementService} from './annoucement.service';

@Injectable()
export class FileHandlerService {
  _resultFileSource: Subject<DataStore[]> = new Subject<DataStore[]>();
  resultFileEmitter: Observable<DataStore[]> = this._resultFileSource.asObservable();

  constructor(private announceSer: AnnoucementService) { }

  async fileHandler(e, loadHeader) {
    return new Promise<DataStore>((resolve, reject) => {
      if (typeof e === 'string') {
        const lines = e.split(/\r\n|\r|\n/);
        const result: DataRow[] = [];
        lines.map((line) => {
          if (line.length > 0) {
            result.push(new DataRow(line.split(/\t/)));
          }
        });
        resolve(new DataStore(result, loadHeader, ''));
      } else {
        const file = e.target.files[0];
        const reader = new FileReader();
        const result: DataRow[] = [];
        reader.onload = (event) => {
          const loadedFile = reader.result;

          const lines = (<string>loadedFile).split(/\r\n|\r|\n/);

          lines.map((line) => {
            if (line.length > 0) {
              result.push(new DataRow(line.split(/\t/)));
            }
          });
          resolve(new DataStore(result, loadHeader, file.name));
        };
        reader.readAsText(file);
      }
    });
  }

  fileHandlerNoE(data) {
    const d: DataRow[] = [];
    const lines = data.split(/\r\n|\r|\n/);
    if (lines.length > 1) {
      for (const line of lines) {
        if (line.length > 0) {
          d.push(new DataRow(line.split(/\t/)));
        }
      }
    }
    return new DataStore(d, true, '');
  }

  saveFile(blob: Blob, fileName: string): void {
    FileSaver.saveAs(blob, fileName);
  }

  createSaveStream(filename: string) {
    return StreamSaver.createWriteStream(filename);
  }

  mitmLocation() {
    console.log(StreamSaver.mitm);
  }

  setMitmLocation(loc: string) {
    StreamSaver.mitm = loc + '?version='
      // + '1.0.5';
      + StreamSaver.version.full;
  }

  checkSaveStreamSupport() {
    return StreamSaver.supported;
  }

}
