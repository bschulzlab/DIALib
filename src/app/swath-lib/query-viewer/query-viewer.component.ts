import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {SwathLibHelperService} from "../../helper/swath-lib-helper.service";
import {Observable, Subscription} from "rxjs";
import {FormGroup} from "@angular/forms";
import {Protein} from "../../helper/protein";
import {SwathQuery} from "../../helper/swath-query";

@Component({
  selector: 'app-query-viewer',
  templateUrl: './query-viewer.component.html',
  styleUrls: ['./query-viewer.component.scss']
})
export class QueryViewerComponent implements OnInit, OnDestroy {
  protein: Observable<Protein>;
  formSub: Subscription;
  proteinSub: Subscription;
  form: FormGroup;
  querySub: Observable<SwathQuery[]>;
  private _p: Protein;
  set p(data: Protein) {
    this._p = data;
  }
  get p(): Protein {
    return this._p;
  }

  constructor(private helper: SwathLibHelperService) {
    this.protein = this.helper.selectedProtein;
    this.querySub = this.helper.selectedQueries;
  }

  ngOnInit() {
    this.formSub = this.helper.generalQueryFormObs.subscribe((data) => {
      this.form = data;
    });
    this.proteinSub = this.helper.selectedProtein.subscribe((data) => {
      this.p = data;
    })

  }

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
    this.proteinSub.unsubscribe();
  }
}
