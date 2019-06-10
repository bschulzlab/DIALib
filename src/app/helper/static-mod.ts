export class StaticMod {
  constructor(aa: string, modTitle: string, mass: number, name: string) {
    this._aa = aa;
    this._modTitle = modTitle;
    this._mass = mass;
    this._name = name;
  }
  get aa(): string {
    return this._aa;
  }

  set aa(value: string) {
    this._aa = value;
  }

  get modTitle(): string {
    return this._modTitle;
  }

  set modTitle(value: string) {
    this._modTitle = value;
  }

  get mass(): number {
    return this._mass;
  }

  set mass(value: number) {
    this._mass = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }
  private _aa: string;
  private _modTitle: string;
  private _mass: number;
  private _name: string;
}
