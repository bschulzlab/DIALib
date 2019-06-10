import {Component, OnInit, Input, OnDestroy, ViewChild} from '@angular/core';
import {SeqCoordinate} from '../../helper/seq-coordinate';
import {Modification} from '../../helper/modification';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  NgbDropdownConfig,
  NgbModal,
  NgbTooltipConfig,

  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import {SwathLibAssetService} from '../../helper/swath-lib-asset.service';
import {Observable} from 'rxjs';
import {SwathResultService} from '../../helper/swath-result.service';
import {SwathQuery} from '../../helper/swath-query';
import {Subscription} from 'rxjs';
import {Oxonium} from '../../helper/oxonium';
import {AnnoucementService} from '../../helper/annoucement.service';
import {SwathLibHelperService} from '../../helper/swath-lib-helper.service';
import {SwathWindows} from "../../helper/swath-windows";

@Component({
  selector: 'app-sequence-selector',
  templateUrl: './sequence-selector.component.html',
  styleUrls: ['./sequence-selector.component.scss'],
  providers: [NgbTooltipConfig, NgbDropdownConfig]
})
export class SequenceSelectorComponent implements OnInit, OnDestroy {
  get query(): SwathQuery {
    return this._query;
  }

  @Input() set query(value: SwathQuery) {
    this._query = value;
    if (!this.libHelper.SequenceMap.has(this.query.protein.unique_id)) {
      this.libHelper.AddMap(this.query.protein.unique_id);
    }
    console.log("Update Query.");
    this.createExtraForm();
  }
  private _query: SwathQuery;

  modalref: NgbModalRef;
  preMadeForm: FormGroup;
  addModForm: FormGroup;
  extraForm: FormGroup;
  staticMods: Observable<Modification[]>;
  variableMods: Observable<Modification[]>;
  Ymods: Observable<Modification[]>;
  oxonium: Observable<Oxonium[]>;
  windows: Observable<SwathWindows[]>;
  rt: Observable<number[]>;
  sent: boolean;
  progress: number;

  progressStage = 'info';
  @ViewChild('coordEditor') coordEditor;

  seqCoord: SeqCoordinate[] = [];
  modMap: Map<number, Modification[]> = new Map<number, Modification[]>();

  SendTriggerSub: Subscription;
  sendTriggerRead: Observable<boolean>;
  conflict: Map<number, SeqCoordinate>;
  by_run = false;
  service;
  oxonium_only = false;
  constructor(private mod: SwathLibAssetService,
              tooltip: NgbTooltipConfig,
              dropdown: NgbDropdownConfig,
              private modalService: NgbModal,
              private fb: FormBuilder,
              private srs: SwathResultService,
              private ans: AnnoucementService,
              private libHelper: SwathLibHelperService) {
    this.staticMods = mod.staticMods;
    this.variableMods = mod.variableMods;
    this.Ymods = mod.YtypeMods;
    this.oxonium = mod.oxoniumReader;
    this.sendTriggerRead = this.srs.sendTriggerReader;
    tooltip.placement = 'top';
    tooltip.triggers = 'hover';
    this.rt = this.libHelper.rtObservable;
    this.windows = this.mod.windowsReader;
  }


  ngOnInit() {

  }

  ngOnDestroy() {
    if (this.SendTriggerSub) {
      this.SendTriggerSub.unsubscribe();
    }
  }


  selectCoordinates(coordinates: number[]) {
    this._query.selectCoordinates(coordinates);
  }


  openEditModal(modal, position) {
    this._query.currentCoord = this._query.seqCoord[position];
    this.modalService.open(modal);
  }

  openProteinEditor(modal) {
    this.modalref = this.modalService.open(modal);
  }

  createForm(position, aa) {
    this.addModForm = this.fb.group({
      'name': ['', Validators.required],
      'mass': [0, Validators.required],
      'regex': aa,
      'multiple_pattern': false,
      'label': [],
      'type': 'static',
      'Ytype': [],
      'status': false,
      'auto_allocation': 'FALSE',
      'positions': [],
      'display_label': ''
    });
  }

  constExtraForm(name: string, oxonium: [], windows: [], rt: []): FormGroup {
    return this.fb.group({
      'name': name,
      'oxonium': oxonium,
      'windows': windows,
      'rt': rt
    })
  }

  createExtraForm() {
    console.log(this._query.form.value['oxonium']);
    this.extraForm = this.constExtraForm(this._query.protein.id, [], [], []);
    /*if (this._query.form.value['oxonium']) {
      if (this._query.form.value['oxonium'].length > 0) {

      } else {
        this.extraForm = this.fb.group({
          'name': '',
          'oxonium': []
        });
      }
    } else {
      this.extraForm = this.fb.group({
        'name': '',
        'oxonium': []
      });
    }*/

  }

  createFormPremade() {
    this.preMadeForm = this.fb.group({
      'static': [],
      'variable': [],
      'ytype': []
    });
  }

  addToCurrent(c) {
    if (c === 'premade') {
      this.helperPremade('static');
      this.helperPremade('variable');
      this.helperPremade('ytype');
    } else {
      this._query.appendMod(this._query.currentCoord,
        new Modification(
          [this._query.currentCoord.coordinate],
          this.addModForm.value['status'],
          this.addModForm.value['multiple_pattern'],
          this.addModForm.value['Ytype'],
          this.addModForm.value['auto_allocation'],
          this.addModForm.value['type'],
          this.addModForm.value['mass'],
          this.addModForm.value['regex'],
          this.addModForm.value['label'],
          this.addModForm.value['name'],
          this.addModForm.value['display_label'],
          0
          ));
    }

    const sm = this._query.summarize(this._query.seqCoord);
    this._query.modifications = sm.modSummary;
    this._query.conflict = Array.from(sm.conflict.values());
  }

  private helperPremade(m) {
    if (this.preMadeForm.value[m] !== null) {
      for (const c of this.preMadeForm.value[m]) {
        this._query.appendMod(this._query.currentCoord, Object.create(c));
      }
    }
  }

  changeStatus(t, m) {
    if (t.checked) {
      for (const k of m.positions) {
        for (const m2 of this._query.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            console.log(this.query.protein.id);
            m2.status = true;
          }
        }
      }
      m.status = true;
    } else {
      for (const k of m.positions) {
        for (const m2 of this._query.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.status = false;
          }
        }
      }
      m.status = false;
    }
  }

  changePattern(t, m) {
    if (t.checked) {
      for (const k of m.positions) {
        for (const m2 of this._query.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.multiple_pattern = true;
          }
        }
      }
      m.multiple_pattern = true;
    } else {
      for (const k of m.positions) {
        for (const m2 of this._query.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.multiple_pattern = false;
          }
        }
      }
      m.multiple_pattern = false;
    }
  }

  saveProtein() {
    if (this.extraForm.value['windows']) {
      if (this.extraForm.value['windows'].length > 0) {
        this.query.windows = this.extraForm.value['windows'];
      }

    }
    if (this.extraForm.value['name']) {
      this.query.protein.id = this.extraForm.value['name'];
    }
    if (this.extraForm.value['rt']) {
      if (this.extraForm.value['rt'].length > 0) {
        this.query.rt = this.extraForm.value['rt'];
      }
    }
    if (this.extraForm.value['oxonium']) {
      if (this.extraForm.value['oxonium'].length > 0) {
        this.query.oxonium = this.extraForm.value['oxonium'];
      }
    }

    this.modalref.close();
  }

  eventHandler(event) {
    switch (event.event) {
      case 'edit':
        this.openEditModal(this.coordEditor, event.residue);
        break;
      case 'bstop':
        this._query.b_stop_at = event.residue;
        break;
        case 'ystop':
            this._query.y_stop_at = event.residue;
            break;
        case 'bselect':

            if (!this._query.b_selected.includes(event.residue)) {
                this._query.b_selected.push(event.residue);
            } else {
                const pos = this._query.b_selected.indexOf(event.residue);
                this._query.b_selected.splice(pos, 1);
            }
            break;
        case 'yselect':

            if (!this._query.y_selected.includes(event.residue)) {
                this._query.y_selected.push(event.residue);
            } else {
                const pos = this._query.y_selected.indexOf(event.residue);
                this._query.y_selected.splice(pos, 1);
            }
            break;
    }
    console.log(event);
  }
}
