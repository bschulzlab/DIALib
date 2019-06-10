export class SwathWindows {
  constructor(start: number, stop: number) {
    this._start = start;
    this._stop = stop;
  }
  get start(): number {
    return this._start;
  }

  set start(value: number) {
    this._start = value;
  }

  get stop(): number {
    return this._stop;
  }

  set stop(value: number) {
    this._stop = value;
  }
  private _start: number;
  private _stop: number;
}
