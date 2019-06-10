export class VariableMod {
  get ions(): Ion[] {
    return this._ions;
  }

  set ions(value: Ion[]) {
    this._ions = value;
  }
  get target(): string {
    return this._target;
  }

  set target(value: string) {
    this._target = value;
  }

  private _target: string;
  private _ions: Ion[];

  constructor(target: string, ions: Ion[]) {
    this._target = target;
    this._ions = ions;
  }
}

export class Ion {
  constructor(label: string, number: string, mass: string, name: string) {
    this._label = label;
    this._number = number;
    this._mass = mass;
    this._name = name;
  }
  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get number(): string {
    return this._number;
  }

  set number(value: string) {
    this._number = value;
  }

  get mass(): string {
    return this._mass;
  }

  set mass(value: string) {
    this._mass = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }
  private _label: string;
  private _number: string;
  private _mass: string;
  private _name: string;
}
