import { NgModule } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActividadesComponent } from './actividades/actividades.component';
import { CategoriasComponent } from './categorias/categorias.component';
import { CrearActividadComponent } from './crear-actividad/crear-actividad.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { CrearCategoriaComponent } from './crear-categoria/crear-categoria.component';
import { IncidenciasComponent } from './incidencias/incidencias.component';
import { ResolverIncidenciaComponent } from './resolver-incidencia/resolver-incidencia.component';
import { AdminLayoutComponent } from '../layouts/admin-layout/admin-layout.component';
import { CrearUsuarioComponent } from './crear-usuario/crear-usuario.component';
import { VerActividadComponent } from './ver-actividad/ver-actividad.component';
import { VerUsuarioComponent } from './ver-usuario/ver-usuario.component';



@NgModule({
  declarations: [
    AdminLayoutComponent,
    ActividadesComponent,
    CategoriasComponent,
    CrearActividadComponent,
    UsuariosComponent,
    CrearCategoriaComponent,
    IncidenciasComponent,
    ResolverIncidenciaComponent,
    CrearUsuarioComponent,
    VerActividadComponent,
    VerUsuarioComponent
  ],
  exports: [
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class AdminModule { }
