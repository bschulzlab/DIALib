export class Modification {
  get offset(): number {
    return this._offset;
  }

  set offset(value: number) {
    this._offset = value;
  }
  get m_label(): string {
    return this._m_label;
  }

  set m_label(value: string) {
    this._m_label = value;
  }
  get forErase(): boolean {
    return this._forErase;
  }

  set forErase(value: boolean) {
    this._forErase = value;
  }

  get positions(): Array<number> {
    return this._positions;
  }

  set positions(value: Array<number>) {
    this._positions = value;
  }

  get status(): boolean {
    return this._status;
  }

  set status(value: boolean) {
    this._status = value;
  }

  get multiple_pattern(): boolean {
    return this._multiple_pattern;
  }

  set multiple_pattern(value: boolean) {
    this._multiple_pattern = value;
  }

  get Ytype(): string {
    return this._Ytype;
  }

  set Ytype(value: string) {
    this._Ytype = value;
  }

  get auto_allocation(): string {
    return this._auto_allocation;
  }

  set auto_allocation(value: string) {
    this._auto_allocation = value;
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }

  get mass(): number {
    return this._mass;
  }

  set mass(value: number) {
    this._mass = value;
  }

  get regex(): string {
    return this._regex;
  }

  set regex(value: string) {
    this._regex = value;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }
  private _positions: Array<number>;
  private _status: boolean;
  private _multiple_pattern: boolean;
  private _Ytype: string;
  private _auto_allocation: string;
  private _type: string;
  private _mass: number;
  private _regex: string;

  constructor(positions: Array<number>, status: boolean, multiple_pattern: boolean, Ytype: string, auto_allocation: string, type: string, mass: number, regex: string, label: string, name: string, m_label: string, offset: number) {
    this._positions = positions;
    this._status = status;
    this._multiple_pattern = multiple_pattern;
    this._Ytype = Ytype;
    this._auto_allocation = auto_allocation;
    this._type = type;
    this._mass = mass;
    this._regex = regex;
    this._label = label;
    this._name = name;
    this._m_label = m_label;
    this._offset = offset;
    this.forErase = false;
  }

  private _label: string;
  private _name: string;
  private _forErase: boolean;
  private _m_label: string;
  private _offset: number;
}
