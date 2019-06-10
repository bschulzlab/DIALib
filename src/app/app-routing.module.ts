import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SwathLibComponent} from './swath-lib/swath-lib.component';
import {ConnectorComponent} from './components/connector/connector.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
  {path: 'swathlib', component: SwathLibComponent},
  {path: 'connector', component: ConnectorComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
