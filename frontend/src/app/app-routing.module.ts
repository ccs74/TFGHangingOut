import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthRoutingModule } from './auth/auth.routing';
import { AdminRoutingModule } from './admin/admin.routing';
import { ClienteRoutingModule } from './cliente/cliente.routing';

const routes: Routes = [
  { path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: "ignore",
    anchorScrolling:'enabled',
    scrollPositionRestoration: 'enabled'
  }),
  AuthRoutingModule,
  AdminRoutingModule,
  ClienteRoutingModule
],
  exports: [RouterModule]
})
export class AppRoutingModule { }


