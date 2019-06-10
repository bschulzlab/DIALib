export class GppExp {
  constructor(fileNames: string[], targetProtein: string, repMap: Map<string, string>, condMap: Map<string, string>, reps: string[], conds: string[]) {
    this.fileNames = fileNames;
    this.targetProtein = targetProtein;
    this.repMap = repMap;
    this.condMap = condMap;
    this.reps = reps;
    this.conds = conds;
  }
  fileNames: string[];
  targetProtein: string;
  repMap: Map<string, string>;
  condMap: Map<string, string>;
  reps: string[];
  conds: string[];
}
