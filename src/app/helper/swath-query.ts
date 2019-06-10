import {Protein} from './protein';
import {Modification} from './modification';
import {SwathWindows} from './swath-windows';
import {Oxonium} from './oxonium';
import {SeqCoordinate} from './seq-coordinate';
import {FormGroup} from "@angular/forms";

export class SwathQuery {
  selected = "unselect";
  keepProperties = ["_protein", "_modifications", "_oxonium_only", '_rt', '_windows', '_oxonium', '_by_run',
    '_variable_format', '_charge', '_b_stop_at', '_y_stop_at', '_y_selected', '_b_selected', '_precursor_charge', '_conflict'];
    get b_selected() {
        return this._b_selected;
    }

    set b_selected(value) {
        this._b_selected = value;
    }

    get y_selected() {
        return this._y_selected;
    }

    set y_selected(value) {
        this._y_selected = value;
    }
    private _b_selected: number[];
    private _y_selected: number[];
  get oxonium_only(): boolean {
    return this._oxonium_only;
  }

  set oxonium_only(value: boolean) {
    this._oxonium_only = value;
  }
  get by_run(): boolean {
    return this._by_run;
  }

  set by_run(value: boolean) {
    this._by_run = value;
  }
  constructor(protein?: Protein, modifications?: Modification[], windows?: SwathWindows[], rt?: Array<number>, extra?: number, charge?: number, precursor_charge?: number, conflict?: SeqCoordinate[]) {
    this._protein = protein;
    this._modifications = modifications;
    this._windows = windows;
    this._rt = rt;
    this._extra = extra;
    this._charge = charge;
    this._precursor_charge = precursor_charge;
    this._conflict = conflict;
  }
  get conflict(): SeqCoordinate[] {
    return this._conflict;
  }

  set conflict(value: SeqCoordinate[]) {
    this._conflict = value;
  }
  get variable_format(): string {
    return this._variable_format;
  }

  set variable_format(value: string) {
    this._variable_format = value;
  }
  get b_stop_at(): number {
    return this._b_stop_at;
  }

  set b_stop_at(value: number) {
    this._b_stop_at = value;
  }
  get y_stop_at(): number {
    return this._y_stop_at;
  }

  set y_stop_at(value: number) {
    this._y_stop_at = value;
  }
  get oxonium(): Oxonium[] {
    return this._oxonium;
  }

  set oxonium(value: Oxonium[]) {
    const newOxonium = [];
    if (value) {
      for (const o of value) {
        /*if (this.modifications.length > 0) {
          for (const m of this.modifications) {
            if (o.dependencies.includes(m.name)) {
              if (!newOxonium.includes(o)) {
                newOxonium.push(o);
              }
              break;
            }
          }
        }*/
        newOxonium.push(o);
      }
      if (newOxonium.length > 0) {
        this._oxonium = newOxonium;
      }
    }
  }


  get precursor_charge(): number {
    return this._precursor_charge;
  }

  set precursor_charge(value: number) {
    this._precursor_charge = value;
  }

  get extra(): number {
    return this._extra;
  }

  set extra(value: number) {
    this._extra = value;
  }

  get windows(): SwathWindows[] {
    return this._windows;
  }

  set windows(value: SwathWindows[]) {
    this._windows = value;
  }

  get rt(): Array<number> {
    return this._rt;
  }

  set rt(value: Array<number>) {
    this._rt = value;
  }

  get protein(): Protein {
    return this._protein;
  }

  set protein(value: Protein) {
    this._protein = value;
  }

  get modifications(): Modification[] {
    return this._modifications;
  }

  set modifications(value: Modification[]) {
    this._modifications = value;
  }

  get charge(): number {
    return this._charge;
  }

  set charge(value: number) {
    this._charge = value;
  }
  modMap: Map<number, Modification[]>;
  libHelper: any;
  form: FormGroup;
  currentCoord: SeqCoordinate;
  seqCoord: SeqCoordinate[];
  progressStage = "info";
  sent = false;
  progress = 0;
  private _protein: Protein;
  private _modifications: Modification[];
  private _windows: SwathWindows[];
  private _rt: Array<number>;
  private _extra: number;
  private _charge: number;
  private _precursor_charge: number;
  private _b_stop_at: number;
  private _y_stop_at: number;
  private _variable_format: string;
  private _oxonium: Oxonium[];
  private _conflict: SeqCoordinate[];
  private _by_run: boolean;
  private _oxonium_only: boolean;

  decorSeq() {
    if (this.form.value["static"] !== null || this.form.value["variable"] !== null || this.form.value["ytype"] !== null) {
      this.applyModification(this.protein);
    }
    this.transformSequence(this.protein);
  }

  transformSequence(protein: Protein) {
    this.modifications = [];
    this.seqCoord = [];
    for (let i = 0; i < protein.sequence.length; i++) {
      const s = new SeqCoordinate(protein.sequence[i], i, '', []);
      this.setMod(i, s);
      this.seqCoord.push(s);
    }

    const sm = this.summarize(this.seqCoord);
    this.modifications = sm.modSummary;
    this.conflict = Array.from(sm.conflict.values());
  }

  setMod(i: number, s: SeqCoordinate) {
    if (this.modMap !== undefined) {
      if (this.modMap.has(i)) {
        for (const m of this.modMap.get(i)) {
          this.appendMod(s, m);
        }
      }
    }
  }

  appendMod(s, m) {
    if (s.modType !== m.type) {

      if (s.modType !== '') {
        s.modType = 'conflicted';
      } else {
        s.modType = m.type;
      }
    } else {
      if (s.modType !== 'Ytype') {
        s.modType = 'conflicted';
      }
    }
    s.mods.push(m);
  }

  applyModification(protein: Protein) {
    this.modifySeq(protein, 'static');
    this.modifySeq(protein, 'variable');
    this.modifySeq(protein, 'ytype');
  }

  modifySeq(f, modCat) {
    if (this.form.value[modCat] !== null) {
      for (const m of this.form.value[modCat]) {
        const reg = new RegExp(m.regex, 'g');
        let seq = f.sequence;
        if (f.metadata !== undefined) {
          if (m.offset !== 0) {
            if (f.metadata.originalEnd + m.offset <= f.metadata.original.sequence.length) {
              seq = f.metadata.original.sequence.slice(f.metadata.originalStart, f.metadata.originalEnd + m.offset);
            }
          }
        }
        let match = reg.exec(seq);
        while (match != null) {
          const newMod = Object.create(m);
          for (const key in newMod) {
            newMod[key] = newMod[key];
          }
          if (this.modMap.has(match.index)) {
            const mM = this.modMap.get(match.index);
            mM.push(newMod);

            this.modMap.set(match.index, mM);
          } else {
            const n = [];
            n.push(newMod);
            this.modMap.set(match.index, n);
          }
          match = reg.exec(seq);
        }
      }
    }
  }

  summarize(seqCoord: SeqCoordinate[]) {
    const modSummary = [];
    const conflict = new Map<number, SeqCoordinate>();
    const summaryMap = new Map<string, number>();

    let count = 0;
    for (const i of seqCoord) {
      if (i.mods.length > 0) {
        if (i.modType === 'conflicted') {
          conflict.set(i.coordinate, i);
        }
        for (const m of i.mods) {
          if (summaryMap.has(m.name + m.Ytype)) {
            const sumIndex = summaryMap.get(m.name + m.Ytype);
            modSummary[sumIndex].positions.push(i.coordinate);
          } else {
            const newMod = Object.create(m);
            for (const key in newMod) {
              newMod[key] = newMod[key];
            }
            modSummary.push(newMod);
            modSummary[count].positions = [];
            modSummary[count].positions.push(i.coordinate);
            if (m.status !== false) {
              modSummary[count].status = m.status;
            }
            summaryMap.set(m.name + m.Ytype, count);
            count ++;
          }
        }
      }
    }
    this.libHelper.Change(this.protein.unique_id, true);
    return {modSummary, conflict};
  }

  removeModification(m) {
    m.forErase = true;
    let ind = -1;
    for (let i = 0; i < this.currentCoord.mods.length; i++) {
      if (this.currentCoord.mods[i].forErase) {
        ind = i;
        break;
      }
    }
    if (ind !== -1) {
      this.currentCoord.mods.splice(ind, 1);
      let temp = '';
      for (const mod of this.currentCoord.mods) {
        if (temp === '') {
          temp = mod.type;
        } else {
          if (temp === mod.type) {
            if (temp !== 'Ytype') {
              temp = 'conflicted';
              break;
            }
          } else {
            temp = 'conflicted';
            break;
          }
        }
      }
      this.currentCoord.modType = temp;
      const sm = this.summarize(this.seqCoord);
      this.modifications = sm.modSummary;
      this.conflict = Array.from(sm.conflict.values());
    }
  }

  clearModifications() {
    for (const s of this.seqCoord) {
      s.modType = undefined;
      s.mods = [];
    }
    const sm = this.summarize(this.seqCoord);
    this.modifications = sm.modSummary;
    this.conflict = Array.from(sm.conflict.values());
  }

  selectCoordinates(coordinates: number[]) {
    /*for (const c of coordinates) {
      const el = this.getElement(this.protein.unique_id + c);
      el.click();
    }*/
    console.log(coordinates);
    this.libHelper.Selected(this.protein.unique_id, coordinates);
  }
  toJsonable() {
    const a = {};
    for (const i of this.keepProperties) {
      a[i] = this[i];
    }
    return a;
  }
}
