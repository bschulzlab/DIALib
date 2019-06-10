export class GppQuery {
  reps = [];
  conds = [];
  constructor(protein: string, repsMap, condsMap, maxSites: number, minimumArea: number) {
    this.protein = protein;
    this.repsMap = repsMap;
    this.condsMap = condsMap;
    this.maxSites = maxSites;
    this.minimumArea = minimumArea;
  }
  protein: string;
  repsMap;
  condsMap;
  maxSites: number;
  minimumArea: number;
}
