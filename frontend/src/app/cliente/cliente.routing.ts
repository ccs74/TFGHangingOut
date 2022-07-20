import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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

const routes: Routes = [
  { path: 'inicio', component: ClienteLayoutComponent, data: { rol: ['ROL_USUARIO'],
                                                        ruta: '/cliente/elegir-categorias',
                                                        titulo: 'Elegir Categorías'}
  },
  { path: 'elegir-categorias', component: ElegirCategoriasComponent,    data: { rol: ['ROL_USUARIO'],
                                                                        ruta: '/elegir-categorias',
                                                                        titulo: 'Elegir Categorías'}
  },
  { path: 'editar-perfil', component: EditarPerfilComponent, data: {  rol: ['ROL_USUARIO'],
                                                                      ruta: '/editar-perfil',
                                                                      titulo: 'Editar Perfil'}
  },
  { path: 'resultados-actividades', component: ResultadosActividadesComponent, data: { rol: ['ROL_USUARIO'],
                                                                                        ruta: '/explorar',
                                                                                        titulo: 'Explorar'}
  },
  { path: 'actividades',
    children: [
      { path: 'organizadas', component: ActividadesOrganizadasComponent, data: { rol: ['ROL_USUARIO'],
                                                                                  ruta: '/actividades/organizadas',
                                                                                  titulo: 'Actividades'}
      },
      { path: 'asistidas', component: ActividadesAsistidasComponent, data: { rol: ['ROL_USUARIO'],
                                                                                  ruta: '/actividades/asistidas',
                                                                                  titulo: 'Actividades'}
      },
      { path: 'favoritas', component: ActividadesFavoritasComponent, data: { rol: ['ROL_USUARIO'],
                                                                                  ruta: '/actividades/favoritas',
                                                                                  titulo: 'Actividades'}
      },
      { path: 'crear-actividad', component: CrearActividadComponent, data: { rol: ['ROL_USUARIO'],
                                                                              ruta: 'actividades/crear-actividad',
                                                                              titulo: 'Crear Actividad'}
      },
      { path: 'editar-actividad/:uid', component: EditarActividadComponent, data: { rol: ['ROL_USUARIO'],
                                                                              ruta: 'actividades/editar-actividad',
                                                                              titulo: 'Editar Actividad'}
      },
      { path: 'ver-actividad/:uid', component: VerActividadComponent, data: { rol: ['ROL_USUARIO'],
                                                                              ruta: 'actividades/ver-actividad',
                                                                              titulo: 'Ver Actividad'}
      }
    ]
  },
  { path: 'chats',
    children: [
      { path: '', component: ChatsComponent, data: { rol: ['ROL_USUARIO'],
                                                      ruta: '/chats',
                                                      titulo: 'Chats'}
      },
      { path: ':uid', component: ChatComponent, data: { rol: ['ROL_USUARIO'],
                                                        ruta: '/chat',
                                                        titulo: 'Chat'}
      }
    ]
  },
  { path: 'usuarios',
    children: [
      { path: '', component: UsuariosComponent, data: { rol: ['ROL_USUARIO'],
                                                      ruta: '/usuarios',
                                                      titulo: 'Usuarios'}
      },
      { path: ':uid', component: VerUsuarioComponent, data: { rol: ['ROL_USUARIO'],
                                                        ruta: '/usuarios/:uid',
                                                        titulo: 'Ver Usuario'}
      },
      { path: 'denunciar/:uid', component: DenunciarComponent, data: { rol: ['ROL_USUARIO'],
                                                                        ruta: 'usuarios/denunciar/:uid',
                                                                        titulo: 'Denunciar Usuario'}
      }
    ]
  },
  { path: 'cambiar-contraseña', component: CambiarPassComponent, data: { rol: ['ROL_USUARIO'],
                                                                                        ruta: '/cambiar-contraseña',
                                                                                        titulo: 'Cambiar Contraseña'}
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClienteRoutingModule { }
