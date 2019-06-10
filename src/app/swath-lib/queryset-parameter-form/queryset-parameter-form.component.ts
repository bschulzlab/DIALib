import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SwathLibAssetService} from '../../helper/swath-lib-asset.service';
import {Observable} from 'rxjs';
import {Modification} from '../../helper/modification';
import {SwathWindows} from '../../helper/swath-windows';
import {Oxonium} from '../../helper/oxonium';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";

@Component({
  selector: 'app-queryset-parameter-form',
  templateUrl: './queryset-parameter-form.component.html',
  styleUrls: ['./queryset-parameter-form.component.scss']
})
export class QuerysetParameterFormComponent implements OnInit {
  @Output() queryForm: EventEmitter<FormGroup> = new EventEmitter();
  @Input() rt: number[] = [];
  staticMods: Observable<Modification[]>;
  variableMods: Observable<Modification[]>;
  Ymods: Observable<Modification[]>;
  windows: Observable<SwathWindows[]>;
  oxonium: Observable<Oxonium[]>;
  form: FormGroup;

  constructor(private mod: SwathLibAssetService, private fb: FormBuilder) {
    this.staticMods = mod.staticMods;
    this.variableMods = mod.variableMods;
    this.Ymods = mod.YtypeMods;
    this.oxonium = mod.oxoniumReader;
    this.windows = mod.windowsReader;
  }

  ngOnInit() {
    this.createForm();
    this.mod.getAssets('assets/new_mods.json').subscribe((resp) => {
      this.mod.updateMods(resp.body['data']);
    });
    this.mod.getAssets('assets/windows.json').subscribe((resp) => {
      this.mod.updateWindows(resp.body['data']);
    });
    this.mod.getAssets('assets/oxonium_ions.json').subscribe((resp) => {
      this.mod.updateOxonium(resp.body['data']);
    });
  }

  createForm() {
    this.form = this.fb.group({
      'static': [],
      'variable': [],
      'ytype': [],
      'rt': [],
      'windows': [],
      'oxonium': [],
      'extra-mass': 0,
      'precursor-charge': 2,
      'max-charge': 2,
      'ion-type': [],
      'variable-bracket-format': 'windows'
    });
  }

  emitFormValues() {
    console.log(this.form);
    this.queryForm.emit(this.form);
  }

  rounding(n: number): number {
    return Math.round(n * 10000) / 10000;
  }
}
