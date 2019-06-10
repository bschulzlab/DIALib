import { Injectable } from '@angular/core';
import {DataStore, Result} from './data-row';
import {Subject} from 'rxjs';
import {NgForm} from '@angular/forms';

@Injectable()
export class NglycoService {
  private _ResultSource = new Subject<Result[]>();
  nGlyResult = this._ResultSource.asObservable();

  private _resultStatusSource = new Subject<boolean>();
  ResultStatus = this._resultStatusSource.asObservable();

  constructor() { }

  updateResult(result: Result[]) {
    this._ResultSource.next(result);
  }

  updateResultStatus(status: boolean) {
    this._resultStatusSource.next(status);
  }

  nGlycoParser(result: DataStore, f: NgForm) {
    const r: Result[] = [];
    let n = 0;
    for (const h of result.header) {
      if (h === f.value.columnName) {
        result.seqColumn = n;
      } else if (h === f.value.modColumn) {
        result.modColumn = n;
      }
      n += 1;
    }
    console.log(result.seqColumn);
    const d = DataStore.filterSequon(f.value.ignoreMod, result.data, result.seqColumn);
    r.push(DataStore.toCSV(result.header, d, 'sequon_parsed_' + result.fileName, 'Sequon parsed'));
    if (f.value.modFilter) {
      const fMod = DataStore.filterMod(f.value.mod.split(','), result.modColumn, d);
      if (fMod[0].length > 0) {
        r.push(DataStore.toCSV(result.header, fMod[0], 'with_mods_' + result.fileName, 'Sequons with modifications ' + f.value.mod));
      }
      if (fMod[1].length > 0) {
        r.push(DataStore.toCSV(result.header, fMod[1], 'without_mods_' + result.fileName, 'Sequons without modifications ' + f.value.mod));
      }
    }
    this.updateResult(r);
    this.updateResultStatus(true);
  }
}
