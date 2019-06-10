import {Modification} from "./modification";

export class SeqCoordinate {
  constructor(aa: string, coordinate: number, modType: string, mods: Modification[]) {
    this._aa = aa;
    this._coordinate = coordinate;
    this._modType = modType;
    this._mods = mods;
  }
  get trigger(): string {
    return this._trigger;
  }

  set trigger(value: string) {
    this._trigger = value;
  }

  get aa(): string {
    return this._aa;
  }

  set aa(value: string) {
    this._aa = value;
  }

  get coordinate(): number {
    return this._coordinate;
  }

  set coordinate(value: number) {
    this._coordinate = value;
  }
  private _aa: string;
  private _coordinate: number;
  private _modType: string;
  private _mods: Modification[];
  private _trigger: string;
  get modType(): string {
    return this._modType;
  }

  set modType(value: string) {
    this._modType = value;
  }

  get mods(): Modification[] {
    return this._mods;
  }

  set mods(value: Modification[]) {
    this._mods = value;
  }
}
