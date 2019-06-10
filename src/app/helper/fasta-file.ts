import {Protein} from './protein';

export class FastaFile {
  constructor(name: string, content: Array<Protein>) {
    this._name = name;
    this._content = content;
  }
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  get content(): Array<Protein> {
    return this._content;
  }

  set content(value: Array<Protein>) {
    this._content = value;
  }
  private _name: string;
  private _content: Array<Protein>;
}
