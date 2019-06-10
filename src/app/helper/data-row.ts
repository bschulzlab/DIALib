

export class DataRow {
  row: string[];

  constructor(row: string[]) {
    this.row = row;
  }

  hasSequon(ncol: number): boolean {
    return /N[^XP][S|T]/.test(this.row[ncol]);
  }

  hasSequonNoMod(ncol: number): boolean {
    const noMod = this.remMod(ncol);
    return /N[^XP][S|T]/.test(noMod);
  }

  remMod(ncol: number): string {
    return this.row[ncol].replace(/\[\w+\]/ig, '');
  }

  hasMod(ncol: number, modList: string[]): boolean {
    let score = 0;
    for (const mod of modList) {
      if (this.row[ncol].includes(mod)) {
        score += 1;
      }
    }
    return score === modList.length;
  }

  hasString(ncol: number, filterStringArray: string[]) {
    return filterStringArray.includes(this.row[ncol]);
  }
}

export class DataStore {
  header: string[];
  data: DataRow[];
  seqColumn: number;
  modColumn: number;
  fileName: string;
  columnMap: Map<string, number>;
  constructor(data: DataRow[], loadHeader: boolean, fileName: string) {
    this.fileName = fileName;
    if (data.length > 1) {
      if (loadHeader) {
        this.header = data[0].row;
        this.data = data.slice(1);
        this.columnMap = new Map();
        for (let i = 0; i < this.header.length; i ++) {
          this.columnMap.set(this.header[i], i);
        }
      } else {
        this.data = data;
      }
    } else {
      this.data = data;
    }
}

  static filterSequon(ignoreMod: boolean, data: DataRow[], seqColumn: number): DataRow[] {
    const d: DataRow[] = [];
    for (const row of data) {
      if (ignoreMod) {
        if (row.hasSequonNoMod(seqColumn)) {
          d.push(row);
        }
      } else {
        if (row.hasSequon(seqColumn)) {
          d.push(row);
        }
      }
    }
    return d;
  }

  static filterRow(filterStringArray: string[], column: number, data: DataRow[]): DataRow[][] {
    const y: DataRow[] = [];
    for (const s of data) {
      if (s.hasString(column, filterStringArray)) {
        filterStringArray = filterStringArray.filter(e => e !== s.row[column]);
        y.push(s);
      }
    }
    const nacc: DataRow[] = [];
    for (const f of filterStringArray) {
      if (f !== '') {
        nacc.push(new DataRow([f]));
      }
    }
    return [y, nacc];
  }

  static filterMod(modList: string[], modColumn: number, data: DataRow[]): DataRow[][] {
    const y: DataRow[] = [];
    const n: DataRow[] = [];
    for (const row of data) {
      if (row.hasMod(modColumn, modList)) {
        y.push(row);
      } else {
        n.push(row);
      }
    }
    return [y, n];
  }

  static getColumnNum (header: string[], colName: string): number {
    let n = 0;
    for (const h of header) {
      if (h === colName) {
        return n;
      }
      n += 1;
    }
    return -1;
  }

  static getGO(header: string[], data: DataRow[]): DataStore {
    const goData: DataRow[] = [];
    const goid = DataStore.getColumnNum(header, 'Gene ontology IDs');
    const entryName = DataStore.getColumnNum(header, 'Entry name');
    goData.push(new DataRow(['Geneontology IDs', 'IEA', 'Entry name']));
    if (goid !== -1 && entryName !== -1) {
      for (const d of data) {
        for (const g of d.row[goid].split('; ')) {
          goData.push(new DataRow([g, 'IEA', d.row[entryName]]));
        }
      }
    }
    if (goData.length > 1) {
      return new DataStore(goData, true, '');
    } else {
      const association = new DataStore([], false, '');
      association.header = goData[0].row;
      return association;
    }
  }

  static toCSV(header: string[], data: DataRow[], fileName: string, jobName: string): Result {
    let csvContent = '';
    if (header) {
      csvContent += header.join('\t') + '\n';
    }
    if (data.length > 0) {
      for (const row of data) {
        if (row.row !== undefined) {
          csvContent += row.row.join('\t') + '\n';
        }
      }
    }
    return new Result(fileName, new Blob([csvContent], {'type': 'text/csv;charset=utf-8;'}), jobName, data.length);
    /*if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, newName);
    } else {
      let link = document.createElement("a");
      if (link.download !== undefined) {
        let linkText = document.createTextNode("Result");
        link.appendChild(linkText);
        link.href = URL.createObjectURL(blob);
        link.download = newName;
        return link
      }
    }*/
  }
}

export class Result {
  jobName: string;
  fileName: string;
  content: Blob;
  length: number;

  constructor(fileName: string, content: Blob, jobName: string, length: number) {
    this.jobName = jobName;
    this.fileName = fileName;
    this.content = content;
    this.length = length;
  }
}
