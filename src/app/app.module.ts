import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import {SvgAnnotationService} from './helper/svg-annotation.service';
import {SwathLibComponent} from './swath-lib/swath-lib.component';
import {SwathLibHelpComponent} from './swath-lib/swath-lib-help/swath-lib-help.component';
import {UserSettingsComponent} from './swath-lib/user-settings/user-settings.component';
import {SequenceSelectorComponent} from './swath-lib/sequence-selector/sequence-selector.component';
import {GraphService} from './helper/graph.service';
import {D3Service} from 'd3-ng2-service';
import {SwathLibAssetService} from './helper/swath-lib-asset.service';
import {SwathLibHelperService} from './helper/swath-lib-helper.service';
import {SeqViewerComponent} from './swath-lib/seq-viewer/seq-viewer.component';
import {SwathResultService} from './helper/swath-result.service';
import {FileHandlerService} from './helper/file-handler.service';
import {UniprotService} from './helper/uniprot.service';
import {NglycoService} from './helper/nglyco.service';
import {ConnectorService} from './helper/connector.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AnnoucementService} from './helper/annoucement.service';
import {SvgContextMenuService} from './helper/svg-context-menu.service';
import {ConnectorComponent} from './components/connector/connector.component';
import {QuerysetParameterFormComponent} from "./swath-lib/queryset-parameter-form/queryset-parameter-form.component";
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {FastaFileService} from "./helper/fasta-file.service";
import { QueryViewerComponent } from './swath-lib/query-viewer/query-viewer.component';
import { QuerySumComponent } from './swath-lib/query-sum/query-sum.component';
import {NgxPaginationModule} from "ngx-pagination";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    SwathLibComponent,
    SwathLibHelpComponent,
    UserSettingsComponent,
    SequenceSelectorComponent,
    SeqViewerComponent,
    ConnectorComponent,
    QuerysetParameterFormComponent,
    SidebarComponent,
    QueryViewerComponent,
    QuerySumComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgbModule,
    NgxPaginationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ElectronService,
    D3Service,
    FileHandlerService,
    UniprotService,
    NglycoService,
    SwathLibAssetService,
    SwathLibHelperService,
    SwathResultService,
    ConnectorService,
    GraphService,
    SvgAnnotationService,
    AnnoucementService,
    SvgContextMenuService,
    FastaFileService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
declare global {
  interface  Array<T> {
    extend(Array: any[]);
  }
}
Array.prototype.extend = function (other_array: any[]) {
  other_array.forEach(function(v) {this.push(v); }, this);
};
