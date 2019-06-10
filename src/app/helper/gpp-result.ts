export class GppResult {
  constructor(protein: string, filename: string, url: string) {
    this._protein = protein;
    this._filename = filename;
    this._url = url;
  }

  get protein(): string {
    return this._protein;
  }

  set protein(value: string) {
    this._protein = value;
  }

  get filename(): string {
    return this._filename;
  }

  set filename(value: string) {
    this._filename = value;
  }

  get url(): string {
    return this._url;
  }

  set url(value: string) {
    this._url = value;
  }
  private _protein: string;
  private _filename: string;
  private _url: string;
}
