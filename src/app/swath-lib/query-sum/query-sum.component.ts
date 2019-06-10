import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Protein} from "../../helper/protein";
import {SwathQuery} from "../../helper/swath-query";
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";
import {Subscription} from "rxjs";
import {FormGroup} from "@angular/forms";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-query-sum',
  templateUrl: './query-sum.component.html',
  styleUrls: ['./query-sum.component.scss'],
  animations: [
    trigger('selected', [
      state('select', style({
        color: "red",
      })),
      state('unselect', style({
        color: "black",
      })),
      transition('select => unselect', [
        animate(500)
      ]),
      transition('unselect => select', [
        animate(500)
      ])
    ])
  ]
})
export class QuerySumComponent implements OnInit, OnDestroy {
  @Input() protein: Protein;
  @Output() outQuery = new EventEmitter<SwathQuery>();
  query: SwathQuery;
  formSub: Subscription;
  form: FormGroup;

  constructor(private libHelper: SwathLibHelperService) {

  }

  ngOnInit() {
    this.formSub = this.libHelper.generalQueryFormObs.subscribe((data)=>{
      this.form = data;
      if (this.form) {
        if (this.protein) {
          if (!this.libHelper.SequenceMap.has(this.protein.unique_id)) {
            this.libHelper.AddMap(this.protein.unique_id);
          }
          if (!this.libHelper.queryMap.has(this.protein.unique_id)) {
            this.query = this.libHelper.createQuery(this.protein, [], this.form.value['windows'], this.form.value['rt'],
              this.form.value['extra-mass'], this.form.value['max-charge'], this.form.value['precursor-charge'],
              -1, -1, this.form.value['variable-bracket-format'], //this.extraForm.value['oxonium'],
              this.form.value['oxonium'], null, false, false, [], [], this.form
            );
            console.log("Update query of " + this.protein.unique_id);
            this.libHelper.queryMap.set(this.protein.unique_id, this.query);
          } else {
            this.query = this.libHelper.queryMap.get(this.protein.unique_id);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
    if (this.protein) {
      //this.libHelper.SequenceMap.delete(this.protein.unique_id);
      //this.libHelper.queryMap.delete(this.protein.unique_id);
    }
  }

  createQuery(protein, modSummary, windows, rt, extramass, maxcharge, precursorcharge, b_stop_at, y_stop_at,
                      variableformat, oxonium, conflict, by_run, oxonium_only, b_selected, y_selected) {
    const query = new SwathQuery(protein, modSummary, windows, rt, extramass, maxcharge, precursorcharge, conflict);
    query.b_stop_at = b_stop_at;
    query.y_stop_at = y_stop_at;
    query.by_run = by_run;
    query.variable_format = variableformat;
    query.oxonium = oxonium;
    query.oxonium_only = oxonium_only;
    query.b_selected = b_selected;
    query.y_selected = y_selected;
    query.libHelper = this.libHelper;
    query.modMap = new Map();
    query.form = this.form;
    query.seqCoord = [];
    query.decorSeq();
    if (query.form.value['ion-type']) {
      query.protein.ion_type = query.form.value['ion-type'].join().replace(/,/g, '');
    } else {
      query.protein.ion_type = '';
    }
    console.log(query);
    return query;
  }


}
