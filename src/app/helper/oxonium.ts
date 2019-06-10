export class Oxonium {
  constructor(components: string, mz: number, dependencies: Array<string>) {
    this._components = components;
    this._mz = mz;
    this._dependencies = dependencies;
  }
  get components(): string {
    return this._components;
  }

  set components(value: string) {
    this._components = value;
  }

  get mz(): number {
    return this._mz;
  }

  set mz(value: number) {
    this._mz = value;
  }

  get dependencies(): Array<string> {
    return this._dependencies;
  }

  set dependencies(value: Array<string>) {
    this._dependencies = value;
  }
  private _components: string;
  private _mz: number;
  private _dependencies: Array<string>;
}
