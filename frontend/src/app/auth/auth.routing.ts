
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RecoveryComponent } from './recovery/recovery.component';
import { AuthLayoutComponent } from '../layouts/auth-layout/auth-layout.component';
import { AuthGuard } from '../guards/auth.guard';
import { RegistroComponent } from './registro/registro.component';
import { VerificationComponent } from './verification/verification.component';

const routes: Routes = [
  { path: 'login', component: AuthLayoutComponent,  /*FIXME: canActivate: [NoauthGuard],*/
      children: [
        { path: '', component: LoginComponent },
      ]
  },
  { path: 'registro', component: AuthLayoutComponent,  /*FIXME: canActivate: [NoauthGuard],*/
      children: [
        { path: '', component: RegistroComponent },
      ]
  },
  { path: 'recovery', component: AuthLayoutComponent, /*FIXME: canActivate: [NoauthGuard],*/
      children: [
        { path: '', component: RecoveryComponent },
        { path: ':email', component: RecoveryComponent}
      ]
  },
  { path: 'verification', component: AuthLayoutComponent,
      children: [
        { path: 'validar/:email', component: VerificationComponent },
        { path: ':token', component: VerificationComponent},
      ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule { }


