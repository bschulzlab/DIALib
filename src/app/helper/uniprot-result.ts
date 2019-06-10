import {DataStore} from "./data-row";

export class UniprotResult {
  constructor(DataFrame: DataStore, Entries: string[]) {
    this._DataFrame = DataFrame;
    this._Entries = Entries;
  }
  get DataFrame(): DataStore {
    return this._DataFrame;
  }

  set DataFrame(value: DataStore) {
    this._DataFrame = value;
  }

  get Entries(): string[] {
    return this._Entries;
  }

  set Entries(value: string[]) {
    this._Entries = value;
  }
  private _DataFrame: DataStore;
  private _Entries: string[];
}
