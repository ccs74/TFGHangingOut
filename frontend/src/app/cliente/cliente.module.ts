import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ClienteRoutingModule } from './cliente.routing';
import { ClienteLayoutComponent } from '../layouts/cliente-layout/cliente-layout.component';
import { ElegirCategoriasComponent } from './elegir-categorias/elegir-categorias.component';
import { EditarPerfilComponent } from './editar-perfil/editar-perfil.component';
import { ResultadosActividadesComponent } from './resultados-actividades/resultados-actividades.component';
import { ActividadesOrganizadasComponent } from './actividades-organizadas/actividades-organizadas.component';
import { CrearActividadComponent } from './crear-actividad/crear-actividad.component';
import { EditarActividadComponent } from './editar-actividad/editar-actividad.component';
import { ActividadesAsistidasComponent } from './actividades-asistidas/actividades-asistidas.component';
import { ActividadesFavoritasComponent } from './actividades-favoritas/actividades-favoritas.component';
import { ChatsComponent } from './chats/chats.component';
import { ChatComponent } from './chat/chat.component';
import { VerActividadComponent } from './ver-actividad/ver-actividad.component';
import { VerUsuarioComponent } from './ver-usuario/ver-usuario.component';
import { DenunciarComponent } from './denunciar/denunciar.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { CambiarPassComponent } from './cambiar-pass/cambiar-pass.component';


@NgModule({
  declarations: [
    ClienteLayoutComponent,
    ElegirCategoriasComponent,
    EditarPerfilComponent,
    ResultadosActividadesComponent,
    ActividadesOrganizadasComponent,
    CrearActividadComponent,
    EditarActividadComponent,
    ActividadesAsistidasComponent,
    ActividadesFavoritasComponent,
    ChatsComponent,
    ChatComponent,
    VerActividadComponent,
    VerUsuarioComponent,
    DenunciarComponent,
    UsuariosComponent,
    CambiarPassComponent,

  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [
    ClienteLayoutComponent
  ],
})
export class ClienteModule { }

