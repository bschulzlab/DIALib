export class DigestRule {
  constructor(name: string, rules: AARule[]) {
    this.name = name;
    this.rules = rules;
  }
  name: string;
  rules: AARule[];
}

export class AARule {
  constructor(aa: string, C: AAExcept[], N: AAExcept[]) {
    this.aa = aa;
    this.C = C;
    this.N = N;

  }
  aa: string;
  C: AAExcept[];
  N: AAExcept[];
}

export class AAExcept {
  constructor(except: AAExceptDetail[]) {
    this.except = except;
  }
  except: AAExceptDetail[];
}

export class AAExceptDetail {
  constructor(aa: string, offset: number) {
    this.aa = aa;
    this.offset = offset;
  }
  aa: string;
  offset: number;
}
